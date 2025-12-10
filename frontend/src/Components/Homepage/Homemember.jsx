import React from 'react';

export default function MembersSection() {

  return (
    <>
      <style>{`
        .members-showcase {
          background: linear-gradient(to bottom, #0f172a, #1e293b);
          padding: 120px 20px;
          position: relative;
          overflow: hidden;
        }

        .members-showcase::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(236, 72, 153, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .members-content-wrap {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .members-badge {
          display: inline-block;
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
          padding: 8px 20px;
          border-radius: 50px;
          font-size: 0.9rem;
          font-weight: 600;
          letter-spacing: 1px;
          border: 1px solid rgba(59, 130, 246, 0.3);
          margin-bottom: 25px;
          animation: fadeInDown 0.8s ease;
        }

        .members-main-title {
          font-size: 3.5rem;
          font-weight: 900;
          color: white;
          margin-bottom: 30px;
          line-height: 1.2;
          animation: fadeInUp 0.8s ease 0.2s both;
        }

        .members-main-title span {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .members-intro {
          font-size: 1.3rem;
          color: #cbd5e1;
          line-height: 1.8;
          max-width: 800px;
          margin: 0 auto 60px;
          animation: fadeInUp 0.8s ease 0.4s both;
        }

        .members-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
          margin-bottom: 60px;
        }

        .member-feature-card {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(71, 85, 105, 0.5);
          border-radius: 20px;
          padding: 40px 30px;
          backdrop-filter: blur(10px);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          animation: fadeInUp 0.8s ease both;
        }

        .member-feature-card:nth-child(1) { animation-delay: 0.5s; }
        .member-feature-card:nth-child(2) { animation-delay: 0.6s; }
        .member-feature-card:nth-child(3) { animation-delay: 0.7s; }

        .member-feature-card:hover {
          transform: translateY(-8px);
          border-color: rgba(139, 92, 246, 0.6);
          box-shadow: 0 20px 60px rgba(139, 92, 246, 0.2);
          background: rgba(30, 41, 59, 0.7);
        }

        .feature-icon-wrap {
          width: 70px;
          height: 70px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin-bottom: 25px;
          position: relative;
        }

        .feature-icon-wrap::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 2px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }

        .feature-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: 15px;
        }

        .feature-description {
          color: #94a3b8;
          line-height: 1.7;
          font-size: 1rem;
        }

        .members-cta-section {
          text-align: center;
          animation: fadeInUp 0.8s ease 0.8s both;
        }

        .explore-button {
          display: inline-flex;
          align-items: center;
          gap: 15px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          padding: 20px 45px;
          border-radius: 50px;
          font-size: 1.15rem;
          font-weight: 700;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.4s ease;
          box-shadow: 0 10px 40px rgba(59, 130, 246, 0.3);
          position: relative;
          overflow: hidden;
        }

        .explore-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .explore-button:hover::before {
          left: 100%;
        }

        .explore-button:hover {
          transform: scale(1.05);
          box-shadow: 0 15px 50px rgba(59, 130, 246, 0.5);
        }

        .button-arrow {
          font-size: 1.4rem;
          transition: transform 0.3s ease;
        }

        .explore-button:hover .button-arrow {
          transform: translateX(5px);
        }

        .members-subtext {
          color: #64748b;
          margin-top: 20px;
          font-size: 0.95rem;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .members-showcase {
            padding: 80px 20px;
          }

          .members-main-title {
            font-size: 2.5rem;
          }

          .members-intro {
            font-size: 1.1rem;
          }

          .members-grid {
            gap: 20px;
          }
        }
      `}</style>

      <section className="members-showcase">
        <div className="members-content-wrap">
          <div style={{ textAlign: 'center' }}>
            <span className="members-badge">COMMUNITY</span>
            
            <h2 className="members-main-title">
              The People Behind <span>Our Success</span>
            </h2>
            
            <p className="members-intro">
              Our cooperative thrives because of the incredible individuals who contribute 
              their expertise, time, and passion. Together, we're building something remarkable 
              that benefits everyone in our community.
            </p>
          </div>

          <div className="members-grid">
            <div className="member-feature-card">
              <div className="feature-icon-wrap">🤝</div>
              <h3 className="feature-title">Collaborative Spirit</h3>
              <p className="feature-description">
                Members work together, sharing knowledge and resources to achieve 
                common goals and uplift the entire community.
              </p>
            </div>

            <div className="member-feature-card">
              <div className="feature-icon-wrap">💡</div>
              <h3 className="feature-title">Diverse Expertise</h3>
              <p className="feature-description">
                Our members bring unique skills and perspectives, creating a rich 
                tapestry of talent and innovation.
              </p>
            </div>

            <div className="member-feature-card">
              <div className="feature-icon-wrap">🌱</div>
              <h3 className="feature-title">Shared Growth</h3>
              <p className="feature-description">
                Every member benefits from collective success, with opportunities 
                for learning, networking, and advancement.
              </p>
            </div>
          </div>

          <div className="members-cta-section">
            <a
              href="/public-members"
              className="explore-button"
            >
              <span>Check our Members</span>
              <span className="button-arrow">→</span>
            </a>

          </div>
        </div>
      </section>
    </>
  );
}