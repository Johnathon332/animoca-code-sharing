export class ProfileDto {
  id: number;
  email: string;
  codes: {
    id: number,
    code: string
  }[];
  referrer: {
    code: string,
    email: string
  }
}