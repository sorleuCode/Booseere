


import React, { useState } from "react";
import "./law.css";
import Footer from "../Homepage/Footer";

const Bylaws = () => {
  const bylaws = [
    
          "Each member shall pay the sum of five hundred naira as minute levy for the development of the association at every meeting day which is subjected to changes as may be agreed upon by the association",
          "Any member who is absent from the meeting without prior message or genuine excuse shall pay a fine of five hundred naira (₦500.00)",
          "Each member shall pay a fine of two hundred naira (₦200.00) as late comer levy to the meeting",
          "Executive members shall pay a fine of five hundred naira (₦500.00) as latecomer levy to the meeting",
          "Each member shall pay the sum of two thousand naira (₦2,000.00) as contribution to the association on every meeting day (i.e savings)",
          "Each member shall pay the sum of five thousand naira (₦5,000.00) as registration fee",
          "Failure to pay back short term loan shall attract two thousand naira (₦2,000.00) only as a fine",
          "Any member who collects short term loan and fails to repay it after 15 days shall attract a ₦2,000 fine and after paying the fine, will not be able to collect another short-term loan for 4 consecutive meetings",
          "All members shall be a member/shareholder of the association",
          "All members and beneficiaries voluntarily agreed to become members without force or inducement and agreed to abide by this Bylaw",
          "The association shall hold meetings every fifteen days (Sunday) by 11:00am",
          "The association is authorized to receive monetary contributions from members every meeting day",
          "The association shall give loan to its members who will be called ‘Beneficiary’",
          "Each member shall bring 2 guarantors, and women must bring a third guarantor (husband/father/brother)",
          "Loan amount shall be documented and signed by the beneficiary, chairman, secretary, founder and guarantors",
          "If a member fails to repay a loan, the guarantor will pay it",
          "A beneficiary cannot withdraw until he/she has refunded their loan and submitted a withdrawal letter (approval takes 3 months)",
          "In case of default, the association may sell the member’s property without a court order",
          "The association may take court action against a defaulting beneficiary, who will bear all expenses",
          "The defaulting beneficiary waives all rights to litigation against the association or executives",
          "The association shall give short-term loan called ‘BASIRI’",
          "Any member who defaults in returning BASIRI will not be eligible for another until after 3 consecutive meetings",
          "A guarantor with good standing can stand again for others",
          "Any member who fights the association shall have his/her assets returned on meeting days (15-day interval)",
          "The maximum loan amount is twenty million naira"

  ];

  const itemsPerPage = Math.ceil(bylaws.length / 2);
  const [page, setPage] = useState(1);

  const start = (page - 1) * itemsPerPage;
  const currentItems = bylaws.slice(start, start + itemsPerPage);

  return (
    <>
      <div className="law-container">
        {/* Header */}
        <div className="law-header">
          <h1 className="law-title">Booseere Laws and Regulations</h1>
          <div className="law-header-line"></div>
          <p className="law-subtitle">
            Official rules and regulations governing membership and operations
          </p>
        </div>

        {/* Bylaws */}
        <div className="law-bylaws-container">
          {currentItems.map((text, i) => (
            <div className="law-bylaw-item" key={start + i}>
              <div className="law-bylaw-number">{start + i + 1}</div>
              <div className="law-bylaw-text">{text}</div>
            </div>
          ))}

          {/* Pagination */}
          <div className="law-pagination">
            {page > 1 && (
              <button className="ultra-3d-btn" onClick={() => setPage(page - 1)}>
                ◀ Prev
              </button>
            )}

            {page < 2 && (
              <button className="ultra-3d-btn" onClick={() => setPage(page + 1)}>
                Next ▶
              </button>
            )}
          </div>

         

          {/* Footer */}
          <div className="law-footer">
            <p className="law-footer-text">
              All members must read and comply with these bylaws
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Bylaws;
