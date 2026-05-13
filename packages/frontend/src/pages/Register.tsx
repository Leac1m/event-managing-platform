import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, BadgeInfo, Camera, ImagePlus, Sparkles, UserPlus } from 'lucide-react';
import { useToast } from '../components/ui/toast';

type Gender = 'Male' | 'Female';

type FormState = {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  department: string;
  matricNumber: string;
};

const MAX_PROFILE_IMAGE_BYTES = 500 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export default function Register() {
  const [formData, setFormData] = useState<FormState>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    gender: 'Male',
    department: '',
    matricNumber: '',
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { pushToast } = useToast();

  useEffect(() => {
    return () => {
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      setProfileImage(null);
      setProfilePreview('');
      return;
    }

    if (!ALLOWED_PROFILE_IMAGE_TYPES.has(file.type)) {
      setProfileImage(null);
      setProfilePreview('');
      setError('Profile photo must be a JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      setProfileImage(null);
      setProfilePreview('');
      setError('Profile photo must be 500KB or smaller.');
      return;
    }

    setError('');
    setProfileImage(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!profileImage) {
      setError('Profile photo is required.');
      return;
    }

    const submission = new FormData();
    submission.append('username', formData.username);
    submission.append('email', formData.email);
    submission.append('password', formData.password);
    submission.append('firstName', formData.firstName);
    submission.append('lastName', formData.lastName);
    submission.append('gender', formData.gender);
    submission.append('department', formData.department);

    if (formData.matricNumber.trim()) {
      submission.append('matricNumber', formData.matricNumber.trim());
    }

    submission.append('profileImage', profileImage);

    try {
      setIsSubmitting(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: submission,
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        const message = payload.message || 'Registration failed';
        throw new Error(message);
      }

      pushToast({
        title: 'Account created',
        description: 'Check your inbox to verify your email before signing in.',
        variant: 'success',
      });
      navigate('/login');
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : 'Registration failed';
      setError(message);
      pushToast({
        title: 'Registration failed',
        description: message,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
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
                  <label className="field-label" htmlFor="register-first-name">
                    First name
                  </label>
                  <input
                    id="register-first-name"
                    name="firstName"
                    type="text"
                    required
                    className="field"
                    placeholder="Amina"
                    onChange={handleChange}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="register-last-name">
                    Last name
                  </label>
                  <input
                    id="register-last-name"
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
                <label className="field-label" htmlFor="register-username">
                  Username
                </label>
                <input
                  id="register-username"
                  name="username"
                  type="text"
                  required
                  className="field"
                  placeholder="amina.events"
                  onChange={handleChange}
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="register-email">
                  Email
                </label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  required
                  className="field"
                  placeholder="amina@school.edu"
                  onChange={handleChange}
                />
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="register-password">
                  Password
                </label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  required
                  className="field"
                  placeholder="At least 8 characters"
                  onChange={handleChange}
                />
                <p className="field-hint">Use at least 8 characters so your account can be verified safely.</p>
              </div>

              <div className="field-grid field-grid--two">
                <div className="field-group">
                  <label className="field-label" htmlFor="register-gender">
                    Gender
                  </label>
                  <select
                    id="register-gender"
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
                  <label className="field-label" htmlFor="register-department">
                    Department
                  </label>
                  <input
                    id="register-department"
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
                <label className="field-label" htmlFor="register-matric-number">
                  Matric number
                </label>
                <input
                  id="register-matric-number"
                  name="matricNumber"
                  type="text"
                  className="field"
                  placeholder="Optional"
                  onChange={handleChange}
                />
                <p className="field-hint">Optional, but useful for organizer identity checks during scanning.</p>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="register-profile-image">
                  Profile photo
                </label>
                <label
                  htmlFor="register-profile-image"
                  className="flex cursor-pointer items-center gap-4 rounded-[var(--radius-xl)] border border-dashed border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)] p-4 transition hover:border-[rgba(0,229,180,0.3)] hover:bg-[rgba(0,229,180,0.04)]"
                >
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)]">
                    {profilePreview ? (
                      <img src={profilePreview} alt="Profile preview" className="h-full w-full object-cover" />
                    ) : (
                      <Camera className="h-7 w-7 text-[var(--color-primary)]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
                      <ImagePlus size={16} className="text-[var(--color-primary)]" />
                      <span>{profileImage ? profileImage.name : 'Choose a profile image'}</span>
                    </div>
                    <p className="field-hint mt-1">
                      Required. JPEG, PNG, or WebP up to 500KB. The image will be resized to 200x200.
                    </p>
                  </div>
                </label>
                <input
                  id="register-profile-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  className="sr-only"
                  onChange={handleProfileImageChange}
                />
              </div>

              {error && (
                <p className="text-sm text-[var(--color-accent)]" role="alert" aria-live="polite">
                  {error}
                </p>
              )}

              <button type="submit" disabled={isSubmitting} className="btn btn--primary w-full">
                {isSubmitting ? 'Registering...' : 'Register'}
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
