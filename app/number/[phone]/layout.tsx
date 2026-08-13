import { Metadata } from 'next';

type Props = {
  params: { phone: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const decodedPhone = decodeURIComponent(params.phone);
  return {
    title: `Receive SMS Online for ${decodedPhone} | TempNum`,
    description: `Read incoming SMS and verification codes for the virtual number ${decodedPhone}. Free public phone number for testing and bypassing OTP.`,
    keywords: [`${decodedPhone}`, "receive sms", "virtual number", "otp bypass", "sms gateway", "temp number"],
  }
}

export default function NumberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
