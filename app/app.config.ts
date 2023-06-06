type AppConfig = {
  company: {
    name: string;
    privacyPolicyUrl: string;
    twitter: string;
    website: string;
  };
  charity: {
    colors: { name: string; hex: string }[];
    maxPerEvent?: number;
  };
};

export default {
  company: {
    name: "CockroachDB",
    privacyPolicyUrl: "https://www.cockroachlabs.com/privacy/",
    twitter: "cockroachdb",
    website: "https://www.cockroachlabs.com/"
  },
  charity: {
    colors: [
      { name: "pink", hex: "#f433ff" },
      { name: "orange", hex: "#ff5b00" },
      { name: "blue", hex: "#0165fc" },
      { name: "yellow", hex: "#fff917" }
    ],
    maxPerEvent: 4
  }
} satisfies AppConfig;
