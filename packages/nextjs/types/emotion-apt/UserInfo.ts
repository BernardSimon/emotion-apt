export type UserInfo = {
  valid_msg: string;
  name: string;
  sex: string;
  date_of_birth: string;
  education: string;
  occupation: string;
  counselling_hours: string;
  orientations: string;
  techniques: string;
  setUserInfo: (value: UserInfo) => void;
};

export type Record = {
  keywords: string;
  description: string;
  timestamp: string;
};

export type Scale = {
  id: number;
  name: string;
  description: string;
  content: string;
  price: number;
};

export type Scales = {
  scales: Scale[];
};