import { useState, useEffect } from 'react';
import './App.css';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const blankForm = {
  fullName: '',
  batchNumber: '',
  phoneNumber: '',
  department: '',
  societyAffiliation: '',
  interests: '',
  emergencyContact: '',
  dietaryPreferences: '',
};

function GmailHeader() {
  return (
    <div className="gmail-lockup" aria-hidden="true">
      <img
        src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_default_2x_r5.png"
        alt="Gmail"
      />
    </div>
  );
}

function IntroView({ onContinue }) {
  return (
    <div className="card intro-card">
      <div className="intro-aurora" aria-hidden="true" />
      <h1 className="intro-heading">Welcome to Punjab University Cultural Fest</h1>
      <p className="intro-subtitle">
        Celebrate colours, creativity, and campus spirit. Step inside to curate memorable
        experiences for every student performer.
      </p>
      <button className="primary intro-button" onClick={onContinue}>
        Next
      </button>
    </div>
  );
}

function PictureGallery({ onContinue }) {
  // Array of picture paths - show all 6 pictures at once
  const pictures = [
    '/pictures/picture1.png',
    '/pictures/picture2.png',
    '/pictures/picture3.png',
    '/pictures/picture4.png',
    '/pictures/picture5.png',
    '/pictures/picture6.png',
    '/pictures/picture7.png',
    '/pictures/picture8.png',
    '/pictures/picture9.png',
    '/pictures/picture10.png',
  ];

  return (
    <div className="gallery-card">
      <div className="gallery-container">
        <div className="pictures-grid">
          {pictures.map((picture, index) => (
            <div key={index} className={`picture-item picture-item-${index + 1}`}>
              <img
                src={picture}
                alt={`Picture ${index + 1}`}
                className="gallery-image"
              />
            </div>
          ))}
        </div>
      </div>

      <button className="primary gallery-button" onClick={onContinue}>
        Next - Go to Login
      </button>
    </div>
  );
}

function LoginView({ onLogin, loading, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin({ email, password });
  };

  return (
    <div className="card login-card page-enter">
      <GmailHeader />

      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="primary" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in to continue'}
        </button>
      </form>
    </div>
  );
}

function StudentForm({ onSubmit, loading, message }) {
  const [formData, setFormData] = useState(blankForm);

  const updateField = (key) => (event) => {
    setFormData((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData, () => setFormData(blankForm));
  };

  const isError = message.startsWith('Error:');
  const feedbackMessage = isError ? message.replace('Error:', '').trim() : message;

  return (
    <section className="card form-card">
      <header className="card-header">
        <div>
          <h2>Student Cultural Day Line-up</h2>
          <p>
            Capture the bright sparks of Punjab University for a vibrant cultural
            celebration. Every field adds colour to the festival!
          </p>
        </div>
        <span className="badge">2025 Edition</span>
      </header>

      <form className="form grid" onSubmit={handleSubmit}>
        <label className="field">
          <span>Full Name *</span>
          <input
            value={formData.fullName}
            onChange={updateField('fullName')}
            placeholder="Ayesha Khan"
            required
          />
        </label>

        <label className="field">
          <span>Batch Number *</span>
          <input
            value={formData.batchNumber}
            onChange={updateField('batchNumber')}
            placeholder="BSCS-2021"
            required
          />
        </label>

        <label className="field">
          <span>Phone Number *</span>
          <input
            value={formData.phoneNumber}
            onChange={updateField('phoneNumber')}
            placeholder="+92 300 1234567"
            required
          />
        </label>

        <label className="field">
          <span>Department</span>
          <input
            value={formData.department}
            onChange={updateField('department')}
            placeholder="College of Art & Design"
          />
        </label>

        <label className="field">
          <span>Society / Club</span>
          <input
            value={formData.societyAffiliation}
            onChange={updateField('societyAffiliation')}
            placeholder="Drama & Performing Arts Society"
          />
        </label>

        <label className="field">
          <span>Interests</span>
          <textarea
            value={formData.interests}
            onChange={updateField('interests')}
            placeholder="Folk dance, stage anchoring, photography..."
            rows={3}
          />
        </label>

        <label className="field">
          <span>Emergency Contact</span>
          <input
            value={formData.emergencyContact}
            onChange={updateField('emergencyContact')}
            placeholder="Parent / Guardian contact"
          />
        </label>

        <label className="field">
          <span>Dietary Preferences</span>
          <textarea
            value={formData.dietaryPreferences}
            onChange={updateField('dietaryPreferences')}
            placeholder="Vegetarian, food allergies…"
            rows={2}
          />
        </label>

        {message && (
          <div className={isError ? 'error' : 'success'}>{feedbackMessage}</div>
        )}

        <div className="actions">
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Recording…' : 'Submit Registration'}
          </button>
        </div>
      </form>
    </section>
  );
}

function App() {
  const [token, setToken] = useState(() =>
    typeof window !== 'undefined'
      ? window.localStorage.getItem('pu-cultural-token') || ''
      : ''
  );
  const [showIntro, setShowIntro] = useState(true);
  const [showCarousel, setShowCarousel] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState('');

  const handleLogin = async ({ email, password }) => {
    setIsAuthLoading(true);
    setAuthError('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.message || 'Login failed');
      }

      const payload = await response.json();
      setToken(payload.token);
      window.localStorage.setItem('pu-cultural-token', payload.token);
      setShowIntro(false);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleStudentSubmit = async (formValues, reset) => {
    setIsSubmitting(true);
    setFormMessage('');

    try {
      const headers = token
        ? {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        : { 'Content-Type': 'application/json' };

      const response = await fetch(`${API_BASE}/api/students`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formValues),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.message || 'Submission failed');
      }

      const payload = await response.json();
      setFormMessage(payload.message);
      reset();
    } catch (error) {
      setFormMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setFormMessage('');
    window.localStorage.removeItem('pu-cultural-token');
  };

  return (
    <div className="app">
      <div className="aurora" />
      <div className="aurora aurora-delay" />

      <main>
        {!token ? (
          showIntro ? (
            <IntroView onContinue={() => {
              setShowIntro(false);
              setShowCarousel(true);
            }} />
          ) : showCarousel ? (
            <PictureGallery onContinue={() => setShowCarousel(false)} />
          ) : (
            <LoginView onLogin={handleLogin} loading={isAuthLoading} error={authError} />
          )
        ) : (
          <div className="dashboard-enter">
            <header className="top-bar">
              <div>
                <h1>Punjab University Cultural Day Control Room</h1>
                <p>Coordinate performers, manage logistics, and celebrate diversity.</p>
              </div>
              <button className="ghost" onClick={handleLogout}>
                Log out
              </button>
            </header>

            <StudentForm
              onSubmit={handleStudentSubmit}
              loading={isSubmitting}
              message={formMessage}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
