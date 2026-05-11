import { QRCodeSVG } from 'qrcode.react';
import { trpc } from '../lib/trpc';

export default function MyQR() {
  const { data: qrData, isLoading } = trpc.getQRToken.useQuery();
  const { data: me } = trpc.me.useQuery();

  if (isLoading) return <div>Loading QR...</div>;

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow text-center">
      <h1 className="text-2xl font-bold mb-6">My QR Code</h1>
      <div className="flex justify-center bg-gray-100 p-4 rounded-lg">
        {qrData?.token && <QRCodeSVG value={qrData.token} size={256} />}
      </div>
      <div className="mt-6 space-y-2 text-left">
        <p>
          <span className="font-semibold">Name:</span> {me?.firstName} {me?.lastName}
        </p>
        <p>
          <span className="font-semibold">Username:</span> {me?.username}
        </p>
        <p className="text-sm text-gray-500 italic">
          Present this QR code to an organizer to verify your attendance.
        </p>
      </div>
    </div>
  );
}
