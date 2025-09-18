import React from 'react';

function Button() {
  return <button className="px-4 py-2">Click me</button>;
}

const Card = () => {
  return <div className="rounded-lg shadow-md">Card content</div>;
};

export default function App() {
  return (
    <div className="container mx-auto">
      <Button />
      <Card />
    </div>
  );
}