import React, { useState, useEffect, useRef } from "react";
import "./Members.css";

const filterTypes = ["Exco", "Member"];

  const membersData = [
  { name: "Mr Salaudeen Afeez Flenjo", position: "Chairman", phone: "08164586149", image: "/chairman.jpg", address: "Akunsin compound, Ilobu, Osun State" },
  { name: "Mr. Olaitan Muhideen", position: "Vice Chairman", phone: "08062403759", image: "/fais.jpg", address: "Alayan compound, Ilobu, Osun State" },
  { name: "Mr. Mustapha Ismahil Adewale", position: "Secretary", phone: "07038937441", image: "/small.jpg", address: "Oganla compound, Ilobu, Osun State" },
  { name: "Mr. Osunwale Lukman Olamilekan", position: "Treasurer", phone: "07030056953", image: "/luk.jpg", address: "Gbobamu compound, Ilobu, Osun State" },
  { name: "Mr. Adekunle Nureni Adewale", position: "Pro 1", phone: "08140928987", image: "/nurain.jpg", address: "Alayan compound, Ilobu, Osun State" },
  { name: "Mr. Oseni Munirudeen Adesanjo", position: "Auditor, Founding member", phone: "07037877975", image: "/san.jpg", address: "Ajankanamon's compound, Ilobu, Osun State" },
  { name: "Mr. Muftar Satar Ademola", position: "Assistant Secretary", phone: "09067995103", image: "/demola.jpg", address: "Alayan compound, Ilobu, Osun State" },
  { name: "Mr. Olaonipekun Mutiu", position: "Financial Secretary ", phone: "08165013970", image: "/finsec.jpg", address: "Aganna compound, Ilobu, Osun State" },
  { name: "Mr. Aasa Ifagbemileke ", position: "Welfare, Founding member", phone: "08161353962", image: "/ifa.jpg", address: "Agbedemo compound, Ilobu, Osun State" },
  { name: "Mr. Jimoh Mutiu Adepoju", position: "Assistant Welfare", phone: "08169744763", image: "/mutiu.jpg", address: "Ogunkeye compound, Ilobu, Osun State" },
  { name: "Mr. Akanmu Toheeb Olamilekan ", position: "PRO 2", phone: "09164337902", image: "/toheeb.jpg", address: "Ajegunle area, Ilobu, Osun State" },
  { name: "Mr. Rasheed Taoheed Adelaja", position: "Sport Director", phone: "08062203316", image: "/laja.jpg", address: "Alape compound, Ilobu, Osun State" },
  { name: "Mr. Ibraheem Najeem", position: "Assistant Sport Director", phone: "08167037434", image: "/yemi.jpg", address: "Ajibike compound, Ilobu, Osun State" },
  { name: "Mr. Jimoh Saheed", position: "Chief Task Officer", phone: "07066007989", image: "/ikuun.jpg", address: "Ibigbami compound, Ilobu, Osun State" },
  { name: "Mr. Adedeji Saheed", position: "Assistant Chief Task Officer", phone: "08102784645", image: "/irun.jpg", address: "Gbegede's compound, Ilobu, Osun State" },
  { name: "Mr. Raheem Sarafa OLalekan", position: "Task Officer", phone: "08163827108", image: "/lek.jpg", address: "Jagun compound, Ilobu, Osun State" },
  { name: "Mr. Yinusa Sarafadeen Ayinde", position: "Task Officer", phone: "09034956737", image: "/sarafa.jpg", address: "Alagba compound, Ilobu, Osun State" },
  { name: "Mr. Olaniran Lukman", position: "Store Keeper", phone: "09036646889", image: "/lukuk.jpg", address: "Ologele compound Ilobu Osun state" },
  { name: "Mr. Aremu Taiwo", position: "Fine collector", phone: "08107468935", image: "/aro.jpg", address: "Alaro compound, Aro, Osun State" },
  { name: "Mr. Jimoh Ridwan Olalekan", position: "Officer", phone: "07063666812", image: "/olopa.jpg", address: "Oluawo compound, Ilobu, Osun State" },



  
  { name: "Mr. Hassan Abideen", position: "Founding Member/ Ex chairman", phone: "07035058552", image: "/oga6.jpg", address: ",Dagbolu area, Ilobu, Osun State" },
  { name: "Mr. Qoseem Husain Aremu", position: "Founding Member", phone: "08029931124", image: "/alfaa.jpg", address: "Konda area, Ilobu, Osun State" },
  { name: "Mr. Ibraheem Ridwan Alabi", position: " Founding Member / Ex treasurer", phone: "08066632732", image: "/ogalabi.jpg", address: "Akeyan compound, Ilobu, Osun State" },
  { name: "Mr. Olagunju Azeem ", position: " Founding Member", phone: "07030056953", image: "/ilobu.jpg", address: "Oloola compound, Ilobu, Osun State" },
  { name: "Mr. Badmus Hammed", position: "Founding Member", phone: "07031520039", image: "/ogam.jpg", address: "Olobu compound, Ilobu, Osun State" },
  { name: "Mr. Olatoye Tesleem Ayomon", position: "Founding Member / Ex Secretary", phone: "07067231161", image: "/prince.jpg", address: "Ajankanamon compound, Ilobu, Osun State" },
  
  
  { name: "Mr. Olanrele Akinola Aromiwe", position: "Member", phone: "08065052959", image: "/olareleten.jpg", address: "Aromiwe compound, Ilobu, Osun State" },
  { name: "Mr. Jimoh Azeez Folaranmi", position: "Member", phone: "070626961729", image: "/fola6.jpg", address: ", Jagun compound ,Ilobu, Osun State" },
  { name: "Mr. Munirudeen Nasirudeen Kolawole", position: "Member", phone: "08134038386", image: "/munir.jpg", address: "Bara compound, Ilobu, Osun State" },
  { name: "Mr. Salawudeen Taiwo Hassan", position: "Member", phone: "07036157039", image: "/taiwo3.jpg", address: ", Akunsin compound,Ilobu, Osun State" },
  { name: "Mr. Abidoye Oluwafemi Olaitan ", position: "Member", phone: "09024776837", image: "/femi4.jpg", address: ",Olobu compound, Ilobu, Osun State" },
  { name: "Mr. Ibrahim Sakiru Olalekan", position: "Member", phone: "08138651229", image: "/sakir2.jpg", address: "Aganna compound, Ilobu, Osun State" },
  { name: "Mr. AbdulRahman Faruq Adisa ", position: "Member", phone: "09117374985", image: "/ojale.jpg", address: ", Agboni compound,Ilobu, Osun State" },
  { name: "Mr. Adigun Taoheed Olaitan", position: "Member", phone: "07033163701", image: "/taohee7.jpg", address: "Alagba compound, Ilobu, Osun State" },
  { name: "Mr. Fadele Lukman Olasunkanmi ", position: "Member", phone: "09034419616", image: "/fadene.jpg", address: "Oluawo compound, Ilobu, Osun State" },
  { name: "Mr. Fagbohun Adewale Owolabi", position: "Member", phone: "09116249486", image: "/labi11.jpg", address: " Gbobamu area, Ilobu, Osun State" },
  { name: "Mr. Ajibade Lateef Olabode. ", position: "Member", phone: "08136340736", image: "/dway.jpg", address: "Ibikunle estate, Okinni, Osun State" },
  { name: "Mr. Abidogun Ganiyy ", position: "Member", phone: "08130260206", image: "/ganiyy.jpg", address: "jagun compound, Ilobu, Osun State" },
  { name: "Mr.Abdul Rashid Isa ", position: "Member", phone: "07044376495", image: "/isa.jpg", address: "Lanloko compound, Ilobu, Osun State" },
  { name: "Mr.Adegoke Ridwan Olamilekan ", position: "Member", phone: "07030056953", image: "/adegoke.jpg", address: "Aganna compound, Ilobu, Osun State" },
  { name: "Mr.Adebayo Hammed Olaide ", position: "Member", phone: "08162345487", image: "/adebayohammed.jpg", address: "Olode compound, Ilobu, Osun State" },
  

  { name: "Mr. Owoade Alabi Otunba ", position: "Member", phone: "08035620350", image: "/otunba.jpg", address: ", Ilobu, Osun State" },
  { name: "Mr. Shittu Nurain", position: "Member", phone: "07030056953", image: "/ilobu.jpg", address: ", Ilobu, Osun State" },
  
  
  
  { name: "Mr. Akinloye AbdulAzeez Adebayo ", position: "Member", phone: "08143209104", image: "/olago.jpg", address: "Alagbon compound, Ilobu, Osun State" },
  { name: "Mr. Ganiyu Wakeel Ademola", position: "Member", phone: "07033293257", image: "/eko.jpg", address: "Alapata compound, Ilobu, Osun State" },
  { name: "Mr. Mutair Saheed Akofe", position: "Member", phone: "07036427171", image: "/muta.jpg", address: "Seji compound, Ilobu, Osun State" },
  { name: "Mr. Kolawole Majeed", position: "Member", phone: "07069959469", image: "/key12.jpg", address: "Beeku compound, Ilobu, Osun State" },
  { name: "Mr. Taiwo Ismahil ", position: "Member", phone: "O8148185860", image: "/tismahil.jpg", address: "Olaide compound,Ilobu, Osun State" },
  { name: "Mr. Odeyemi Kayode Rafel ", position: "Member", phone: "09028921790", image: "/Rafel.jpg", address: "Akinibi compound, Ilobu, Osun State" },
  { name: "Mr. Amusat Faruq Ayomon", position: "Member", phone: "08028620759", image: "/ayomon.jpg", address: "Akunsin compound, Ilobu, Osun State" },
  { name: "Mr. Usamat Abdul Razak Akofe", position: "Member", phone: "08062846544", image: "/usam.jpg", address: "Gbagun compound, Ilobu, Osun State" },
  { name: "Mr. Oladeji Adewale Abdullah ", position: "Member", phone: "07030056953", image: "/omosesatar.jpg", address: "Ganga area, Ilobu, Osun State" },
  { name: "Mr. Ashir Toheeb Adewale", position: "Member", phone: "07063742141", image: "/omoselek.jpg", address: "Seji compound, Ilobu, Osun State" },
  { name: "Mr. Sheu Jeleel Adisa ", position: "Member", phone: "09165161045", image: "/eeta.jpg", address: "Oweyo compound, Ilobu, Osun State" },
  { name: "Mr. Abdul Rauf Sheriff", position: "Member", phone: "08161298002", image: "/sher.jpg", address: "Ire Akari Area, Ilobu, Osun State" },
  { name: "Mr. Adeoye Qowiyy Ayofe ", position: "Member", phone: "08108713011", image: "/qowi.jpg", address: "Ire Akari, Ilobu, Osun State" },
  { name: "Mr. Jimoh Kabir Olaotan ", position: "Member", phone: "08086582095", image: "/olao.jpg", address: "Akeyan compound, Ilobu, Osun State" },
  { name: "Mr. ", position: "Member", phone: "07030056953", image: "/luk.jpg", address: ", Ilobu, Osun State" },
  { name: "Mr. ", position: "Member", phone: "07030056953", image: "/luk.jpg", address: ", Ilobu, Osun State" },
  


];

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

  const perPage = 15;

  // Filter + search
  useEffect(() => {


    const filteredMembers = membersData.filter((m) => {
  const q = search.trim().toLowerCase();

  const matchesType =
    filter === "All"
      ? true
      : filter === "Exco"
      ? m.position !== "Member"
      : m.position === "Member";

  const matchesSearch =
    !q ||
    m.name.toLowerCase().includes(q) ||
    m.phone.includes(q) ||
    m.position.toLowerCase().includes(q) ||
    m.address.toLowerCase().includes(q);

  return matchesType && matchesSearch;
});


    const totalPages = Math.ceil(filteredMembers.length / perPage);

    // reset to page 1 if current page > total
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
      return;
    }

    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    setDisplayed(filteredMembers.slice(start, end));
  }, [currentPage, search, filter]);

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
    // Scroll back to the top of section
    if (topRef.current) {
      window.scrollTo({
        top: topRef.current.offsetTop - 20,
        behavior: "smooth"
      });
    }
  };

  const total = Math.ceil(
    membersData.filter((m) => {
      const q = search.trim().toLowerCase();
      const matchesType = filter === "All" ? true : m.position === filter;
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.phone.includes(q) ||
        m.position.toLowerCase().includes(q) ||
        m.address.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    }).length / perPage
  );

  return (
    <section className="mem-preview" ref={topRef}>
      <div className="mem-intro">
        <h2 className="mem-title">
          Members Page
        </h2>
        <p>Registered members of the Ilobu Tilers Association.</p>
      </div>

      <div className="mem-controls">
        <input
          type="search"
          placeholder="Search members by name, number or position..."
          value={search}
          onChange={handleSearch}
          className="mem-search"
        />

        <select value={filter} onChange={handleFilter} className="mem-filter">
          <option value="All">All</option>
          <option value="Exco">Exco</option>
          <option value="Member">Member</option>
        </select>
      </div>

      <div className="mem-grid">
        {displayed.map((m, i) => {
          const waUrl = `https://wa.me/${formatPhoneForWhatsApp(m.phone)}?text=${encodeURIComponent(
            `Hello ${m.name}`
          )}`;
          return (
            <div className="mem-card" key={i}>
              <div className="mem-media">
                <img src={m.image} alt={m.name} />
              </div>
              <div className="mem-info">
                <h4>{m.name}</h4>
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

      {/* <Menuicon /> */}
    </section>
  );
}
