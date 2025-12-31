import React from 'react';
import { SmartEditor } from './components/smart-editor';
import './App.css';

function App() {
  const [content, setContent] = React.useState<string>('');

  const handleChange = (newContent: any) => {
    setContent(newContent);
  };

  return (
    <div className="App">
      <h1>Smart Math Editor</h1>
      <SmartEditor
        value={content}
        onChange={handleChange}
        minHeight={300}
        placeholder="Start typing or insert math..."
      />
    </div>
  );
}

export default App;
