import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <input
              name="firstName"
              type="text"
              required
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm px-3"
              placeholder="First Name"
              onChange={handleChange}
            />
            <input
              name="lastName"
              type="text"
              required
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm px-3"
              placeholder="Last Name"
              onChange={handleChange}
            />
          </div>
          <input
            name="username"
            type="text"
            required
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm px-3"
            placeholder="Username"
            onChange={handleChange}
          />
          <input
            name="email"
            type="email"
            required
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm px-3"
            placeholder="Email address"
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            required
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm px-3"
            placeholder="Password (min 8 characters)"
            onChange={handleChange}
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              name="gender"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm px-3"
              onChange={handleChange}
              value={formData.gender}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input
              name="department"
              type="text"
              required
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm px-3"
              placeholder="Department"
              onChange={handleChange}
            />
          </div>
          <input
            name="matricNumber"
            type="text"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm px-3"
            placeholder="Matric Number (optional)"
            onChange={handleChange}
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {registerMutation.isPending ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link to="/login" className="text-indigo-600 hover:text-indigo-500 text-sm">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
