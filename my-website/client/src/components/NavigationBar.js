const NavigationBar = () => {
    return (
      <nav className="navigation-bar">
        <div className="nav-logo">
          {/* Logo and potentially a mobile menu toggle could go here */}
        </div>
        <div className="nav-links">
          <a href="/products">Products</a>
          <a href="/learn" className="hide-on-small">Learn</a> {/* This link will hide on small screens */}
          <a href="/safety" className="hide-on-small">Safety</a> {/* This link will hide on small screens */}
          <a href="/support">Support</a>
          {/* More links can be added as needed */}
        </div>
        <div className="nav-actions">
          <a href="/login" className="nav-login">Log in</a>
          <button className="nav-signup">Create account</button>
        </div>
      </nav>
    );
  };
  
  export default NavigationBar;
  