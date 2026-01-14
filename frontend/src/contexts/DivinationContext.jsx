import { createContext, useContext, useState } from 'react';

const DivinationContext = createContext(null);

export function DivinationProvider({ children }) {
  const [formData, setFormData] = useState(null);
  const [calculation, setCalculation] = useState(null);
  const [reportData, setReportData] = useState(null);

  return (
    <DivinationContext.Provider
      value={{
        formData,
        setFormData,
        calculation,
        setCalculation,
        reportData,
        setReportData,
      }}
    >
      {children}
    </DivinationContext.Provider>
  );
}

export function useDivination() {
  const context = useContext(DivinationContext);
  if (!context) {
    throw new Error('useDivination must be used within DivinationProvider');
  }
  return context;
}
