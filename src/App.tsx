import React from "react";

const App: React.FC = () => {
  return (
    <div className="App">
      <div className="container mx-auto py-2">
        <button className="py-2 px-4 font-semibold rounded shadow-md text-white bg-green-500 active:bg-green-700">
          generate
        </button>
      </div>
    </div>
  );
};

export default App;
