import React from 'react';

export default function ComplexComponent() {
  return (
    <div className="container">
      <header className="header bg-white">
        <nav className="nav flex items-center">
          <a href="#" className="link hover:text-blue-500">Home</a>
        </nav>
      </header>
      <main className="main">
        <section className="section">
          <article className="article prose max-w-none">
            Content
          </article>
        </section>
      </main>
    </div>
  );
}