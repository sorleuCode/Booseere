import React, { useState } from 'react';
import './Onetofive.css';

export default function BooseereConstitution() {
  const [formData, setFormData] = useState({
    day: '',
    month: '',
    year: '',
    chairman: '',
    secretary: '',
    founder: '',
    memberName: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="document-wrapper">
      <div className="document-container">
        <div className="header">
          <div className="header-content">
            <h1 className="main-title">BOOSEERE MULTIPURPOSE CICS LTD</h1>
            <div className="subtitle">ILOBU IN IREPODUN LOCAL GOVERNMENT AREA</div>
            <div className="subtitle">OSUN STATE, NIGERIA</div>
            <div className="motto">"Uniting for a better morrow"</div>
          </div>
          <div className="header-decoration"></div>
        </div>
        
        <div className="content">
          <div className="print-button-container">
            <button onClick={handlePrint} className="print-button">Print Document</button>
          </div>

          <section className="section">
            <h2 className="section-title">Section 1</h2>
            <div className="subsection">
              <h3 className="section-subtitle">A. Name and Address</h3>
              <p>The Association here as described shall be known, called and addressed as <strong>BOOSEERE MULTIPURPOSE CICS LTD, ILOBU IN IREPODUN LOCAL GOVERNMENT AREA OF OSUN STATE</strong>.</p>
            </div>
            
            <div className="subsection">
              <h3 className="section-subtitle">B. Motto</h3>
              <p className="motto-text">"Uniting for a better morrow"</p>
            </div>
            
            <div className="subsection">
              <h3 className="section-subtitle">C. Correspondence</h3>
              <p>All correspondence to the association shall be addressed to the Chairman or Secretary pending the establishment of a secretariat.</p>
            </div>
          </section>
          
          <section className="section">
            <h2 className="section-title">Section 2</h2>
            <h3 className="section-subtitle">Aims and Objectives</h3>
            <ul className="objectives-list">
              <li>To promote members by giving them loan for expansion/development of their business and such a member loan shall be interest free loan.</li>
              <li>To receive monetary contribution from their members on every meeting.</li>
              <li>To promote members by giving them monetary assistance (Short Term Loan) which shall be called "Basiri".</li>
              <li>To promote Love, Unity, Peace and Development among all members of the association.</li>
            </ul>
          </section>
          
          <section className="section">
            <h2 className="section-title">Section 3</h2>
            <h3 className="section-subtitle">Supremacy of the Association/Constitution</h3>
            <p>All members of the association agree and submit that the association shall be supreme over every individual's interest and that this constitution having been agreed upon by members of the association to be made shall be binding on all members.</p>
          </section>
          
          <section className="section">
            <h2 className="section-title">Section 4</h2>
            <h3 className="section-subtitle">Administration</h3>
            <p>As the association expands and to give room for effective administration, it would be divided into units, sub-units and zones as may be agreed upon.</p>
          </section>
          
          <section className="section">
            <h2 className="section-title">Section 5</h2>
            <h3 className="section-subtitle">Membership</h3>
            <p>Members of the association shall consist of every person who owns/contributes money to the association.</p>
          </section>
          
          <div className="agreement-form">
            <h3 className="form-title">Oath/Membership Agreement</h3>
            <p className="agreement-intro">
              This by law agreement is made this{' '}
              <input 
                type="text" 
                name="day"
                value={formData.day}
                onChange={handleInputChange}
                className="inline-input short"
                placeholder="day"
              /> day of{' '}
              <input 
                type="text" 
                name="month"
                value={formData.month}
                onChange={handleInputChange}
                className="inline-input"
                placeholder="month"
              /> 22
              <input 
                type="text" 
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className="inline-input tiny"
                placeholder="__"
                maxLength="2"
              /> between <strong>BOOSEERE MULTIPURPOSE CICS LTD, ILOBU IN IREPODUN LOCAL GOVERNMENT AREA OF OSUN STATE, NIGERIA</strong> represented by:
            </p>
            
            <div className="signature-section">
              <div className="signature-block">
                <input 
                  type="text"
                  name="chairman"
                  value={formData.chairman}
                  onChange={handleInputChange}
                  className="signature-line"
                  placeholder="Chairman's Name & Signature"
                />
                <div className="role-label">(Chairman)</div>
              </div>
              
              <div className="signature-block">
                <input 
                  type="text"
                  name="secretary"
                  value={formData.secretary}
                  onChange={handleInputChange}
                  className="signature-line"
                  placeholder="Secretary's Name & Signature"
                />
                <div className="role-label">(Secretary)</div>
              </div>
              
              <div className="signature-block">
                <input 
                  type="text"
                  name="founder"
                  value={formData.founder}
                  onChange={handleInputChange}
                  className="signature-line"
                  placeholder="Founder's Name & Signature"
                />
                <div className="role-label">(Founder)</div>
              </div>
            </div>
            
            <p className="legal-text">
              (herein referred to as "<strong>ASSOCIATION</strong>") which expression shall where the context so admits include its Heirs, assigns, executors and successors-in-title of the first part.
            </p>
            
            <p className="legal-text member-section">
              And ALHAJA/ALHAJI/CHIEF/MRS/MR/MISS:
            </p>
            
            <div className="form-field">
              <input 
                type="text"
                name="memberName"
                value={formData.memberName}
                onChange={handleInputChange}
                className="full-width-input"
                placeholder="Member's Full Name"
              />
            </div>
            
            <p className="legal-text">
              (herein referred to as "<strong>MEMBER</strong>") which expression shall where the context so admits include his/her heirs, assigns, executors and successors-in-titles of the second part.
            </p>
            
            <div className="signature-block final-signature">
              <div className="signature-line-empty"></div>
              <div className="role-label">(Member's Signature & Date)</div>
            </div>
          </div>
        </div>
        
      <div className="but">
  <a href="/laws">
    <button>OUR Laws</button>
  </a>
</div>

      </div>
    </div>
  );
}