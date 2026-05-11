import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, BadgeInfo, Sparkles, UserPlus } from 'lucide-react';
import { trpc } from '../lib/trpc';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    gender: 'Male' as 'Male' | 'Female',
    department: '',
    matricNumber: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const registerMutation = trpc.register.useMutation({
    onSuccess: () => {
      navigate('/login');
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    registerMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-layout">
          <div className="space-y-6">
            <div>
              <div className="eyebrow">
                <Sparkles className="h-3.5 w-3.5" />
                Create account
              </div>
              <h1 className="hero-title text-[clamp(2rem,4vw,3.2rem)]">Join the platform.</h1>
              <p className="hero-copy max-w-2xl">
                Register once, verify your email, and you can start joining events, generating QR
                passes, and hosting sessions.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="field-grid field-grid--two">
                <div className="field-group">
                  <label className="field-label">First name</label>
                  <input
                    name="firstName"
                    type="text"
                    required
                    className="field"
                    placeholder="Amina"
                    onChange={handleChange}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Last name</label>
                  <input
                    name="lastName"
                    type="text"
                    required
                    className="field"
                    placeholder="Okafor"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Username</label>
                <input
                  name="username"
                  type="text"
                  required
                  className="field"
                  placeholder="amina.events"
                  onChange={handleChange}
                />
              </div>

              <div className="field-group">
                <label className="field-label">Email</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="field"
                  placeholder="amina@school.edu"
                  onChange={handleChange}
                />
              </div>

              <div className="field-group">
                <label className="field-label">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  className="field"
                  placeholder="At least 8 characters"
                  onChange={handleChange}
                />
              </div>

              <div className="field-grid field-grid--two">
                <div className="field-group">
                  <label className="field-label">Gender</label>
                  <select
                    name="gender"
                    className="field--select"
                    onChange={handleChange}
                    value={formData.gender}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="field-group">
                  <label className="field-label">Department</label>
                  <input
                    name="department"
                    type="text"
                    required
                    className="field"
                    placeholder="Computer Science"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Matric number</label>
                <input
                  name="matricNumber"
                  type="text"
                  className="field"
                  placeholder="Optional"
                  onChange={handleChange}
                />
              </div>

              {error && <p className="text-sm text-[var(--color-accent)]">{error}</p>}

              <button type="submit" disabled={registerMutation.isPending} className="btn btn--primary w-full">
                {registerMutation.isPending ? 'Registering...' : 'Register'}
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="text-sm text-[var(--color-text-secondary)]">
              <span>Already have an account?</span>{' '}
              <Link to="/login" className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)]">
                Sign in
              </Link>
            </div>
          </div>

          <aside className="auth-aside">
            <div className="eyebrow mb-0">Registration notes</div>
            <div className="auth-metric">
              <div>
                <strong>Email verification</strong>
                <span>Required before logging in</span>
              </div>
              <BadgeInfo size={18} className="text-[var(--color-info)]" />
            </div>
            <div className="auth-metric">
              <div>
                <strong>Profile data</strong>
                <span>Stored for scan-time identity display</span>
              </div>
              <UserPlus size={18} className="text-[var(--color-primary)]" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
