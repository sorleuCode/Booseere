import React from 'react'

const Law = () => {
  return (
    <div className="law-page">
      <div className="law-container">
        <h1>Cooperative Laws & Regulations</h1>
        <p>This section contains the legal framework and regulations governing our cooperative society.</p>

        <div className="law-content">
          <h2>Coming Soon</h2>
          <p>The detailed laws and regulations section is currently under development.</p>
          <p>Please refer to our constitution document for the current legal framework.</p>
        </div>
      </div>

      <style jsx>{`
        .law-page {
          padding: 40px 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        .law-container {
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        h1 {
          color: #1e293b;
          margin-bottom: 20px;
          text-align: center;
        }
        .law-content {
          text-align: center;
          color: #64748b;
        }
        .law-content h2 {
          color: #374151;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  )
}

export default Law
