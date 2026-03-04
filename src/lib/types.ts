export type ApiHelloResponse = {
  message: string;
  time?: string;
};

export type PageProps = {
  initialData?: ApiHelloResponse;
};
