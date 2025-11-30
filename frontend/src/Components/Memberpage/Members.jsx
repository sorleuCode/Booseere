import React, { useState, useEffect, useRef } from "react";
import { getPublicMembers } from "../../api/members";
import "./Members.css";
import Footer from "../Homepage/Footer";

const filterTypes = ["Exco", "Member"];

function formatPhoneForWhatsApp(phone = "") {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return "234" + digits.slice(1);
  if (digits.startsWith("234")) return digits;
  return digits;
}

export default function Members() {
  const topRef = useRef(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [displayed, setDisplayed] = useState([]);
  const [membersData, setMembersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrorStates, setImageErrorStates] = useState({});

  const perPage = 15;

  // Create a reliable SVG placeholder
  const createPlaceholderImage = (text = 'Member') => {
    const svg = `
      <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4f9cf9;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="300" height="300" fill="url(#grad)"/>
        <circle cx="150" cy="120" r="40" fill="rgba(255,255,255,0.2)"/>
        <text x="150" y="220" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle" dy=".3em">${text}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const defaultPlaceholder = createPlaceholderImage('Member');

  // Handle image errors to prevent infinite loops
  const handleImageError = (e, memberId) => {
    const key = memberId || 'default';
    if (!imageErrorStates[key]) {
      console.warn(`Failed to load image for member ${key}, using placeholder`);
      setImageErrorStates(prev => ({ ...prev, [key]: true }));
      e.target.src = defaultPlaceholder;
      e.target.onerror = null; // Prevent infinite loop
    }
  };

  // Load members from backend on component mount
  useEffect(() => {
    loadMembers();
  }, []);

  // Load members with current filters
  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (search.trim()) {
        params.search = search.trim();
      }
      if (filter !== "All") {
        params.position = filter === "Exco" ? "exco" : "Member";

      }

      const response = await getPublicMembers(params);
      setMembersData(response.data || []);
    } catch (err) {
      console.error("Failed to load members:", err);
      setError("Failed to load members. Please try again.");
      setMembersData([]);
    } finally {
      setLoading(false);
    }
  };

  // Reload members when search or filter changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (membersData.length > 0 || loading) {
        loadMembers();
        setCurrentPage(1); // Reset to first page when filtering
      }
    }, 300); // Debounce search

    return () => clearTimeout(debounceTimer);
  }, [search, filter]);

  // Update displayed members based on current page
  useEffect(() => {
    const totalPages = Math.ceil(membersData.length / perPage);
    
    // Reset to page 1 if current page > total
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
      return;
    }

    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    setDisplayed(membersData.slice(start, end));
  }, [currentPage, membersData, perPage]);

  const handleFilter = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handlePage = (page) => {
    setCurrentPage(page);
    if (topRef.current) {
      window.scrollTo({
        top: topRef.current.offsetTop - 20,
        behavior: "smooth",
      });
    }
  };

  const total = Math.ceil(membersData.length / perPage);

  if (loading && membersData.length === 0) {
    return (
      <section className="mem-preview" ref={topRef}>
        <div className="mem-intro">
          <h2 className="mem-title">Members Page</h2>
          <p>Loading members...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mem-preview" ref={topRef}>
        <div className="mem-intro">
          <h2 className="mem-title">Members Page</h2>
          <p className="error-message">{error}</p>
          <button onClick={loadMembers} className="retry-button">
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <>
    <section className="mem-preview" ref={topRef}>
      <div className="mem-intro">
        <h2 className="mem-title">Members Page</h2>
        <p>Registered members of the Ilobu Tilers Association.</p>
        {membersData.length > 0 && (
          <p className="member-count">Showing {membersData.length} members</p>
        )}
      </div>

      <div className="mem-controls">
        <div className="mem-search-wrapper">
          <input
            type="search"
            placeholder="Search members by name, number or position..."
            value={search}
            onChange={handleSearch}
            className="mem-search"
          />
        </div>

        <div className="mem-filter-wrapper">
          <select value={filter} onChange={handleFilter} className="mem-filter">
            <option value="All">All</option>
            <option value="Exco">Exco</option>
            <option value="Member">Member</option>
          </select>
        </div>
      </div>

      {loading && membersData.length > 0 && (
        <div className="loading-overlay">Updating...</div>
      )}

      {displayed.length === 0 && !loading ? (
        <div className="no-members">
          <p>No members found matching your criteria.</p>
          {search && (
            <button 
              onClick={() => { setSearch(''); setFilter('All'); }} 
              className="clear-filters"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="mem-grid">
          {displayed.map((m, i) => {
            const waUrl = `https://wa.me/${formatPhoneForWhatsApp(m.phone)}?text=${encodeURIComponent(
              `Hello ${m.name}`
            )}`;
            return (
              <div className="mem-card" key={m.membershipNumber || i}>
                <div className="mem-media">
                  <img 
                    src={m.profileImage || defaultPlaceholder} 
                    alt={m.fullName} 
                    onError={(e) => handleImageError(e, m.membershipNumber)}
                    loading="lazy"
                    style={{ 
                      objectFit: 'cover',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                </div>
                <div className="mem-info">
                  <h4>{m.fullName}</h4>
                  <p>{m.position}</p>
                  <p className="mem-address">{m.address}</p>
                  <a href={waUrl} target="_blank" rel="noreferrer">
                     {m.phone}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {total > 1 && (
        <div className="mem-pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePage(currentPage - 1)}
          >
            Prev
          </button>
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => handlePage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === total}
            onClick={() => handlePage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </section>
    <Footer/> 
    </>
  );
}