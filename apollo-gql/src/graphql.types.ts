interface CustomerConfiguration {
  customerId: string;
  apiKey: string;
}

interface Context {
  config: CustomerConfiguration | null;
}

export { CustomerConfiguration, Context };
