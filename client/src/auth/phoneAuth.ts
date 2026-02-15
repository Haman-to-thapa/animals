import { getAuth, signInWithPhoneNumber } from '@react-native-firebase/auth';

export async function sendOtp(phone: string) {
  return signInWithPhoneNumber(getAuth(), phone);
}

export async function confirmOtp(confirmation: any, code: string) {
  return confirmation.confirm(code);
}
