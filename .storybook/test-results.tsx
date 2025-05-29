import React, { useEffect, useState } from 'react';

export const TestResults = () => {
  const [testResults, setTestResults] = useState<string | null>(null);

  useEffect(() => {
    fetch('test-results/playwright-report/index.html')
      .then((response) => response.text())
      .then((html) => setTestResults(html))
      .catch(() => setTestResults('Could not load test results.'));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Results</h1>
      {testResults ? (
        <div dangerouslySetInnerHTML={{ __html: testResults }} />
      ) : (
        <p>Loading test results...</p>
      )}
    </div>
  );
};

export default TestResults;
