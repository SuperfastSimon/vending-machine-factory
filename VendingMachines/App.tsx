import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import BusinessPlanForm from './components/BusinessPlanForm';
import BusinessPlanOutput from './components/BusinessPlanOutput';

const App = () => {
  const [businessPlan, setBusinessPlan] = useState('');

  const generateBusinessPlan = (data) => {
    const plan = `
# Executive Summary
${data.description}

# Market Analysis
Industry: ${data.industry}
Target Market: ${data.targetMarket}
Funding Stage: ${data.fundingStage}
Geographic Focus: ${data.geographicFocus}

# Business Model
[Your business model here]

# Go-to-Market Strategy
[Your go-to-market strategy here]

# Financial Projections
[Your financial projections here]

# Team & Execution Plan
[Your team and execution plan here]
    `;
    setBusinessPlan(plan);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <LandingPage />
      <BusinessPlanForm onGenerate={generateBusinessPlan} />
      {businessPlan && <BusinessPlanOutput plan={businessPlan} />}
    </div>
  );
};

export default App;
