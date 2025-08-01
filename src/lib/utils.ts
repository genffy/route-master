export async function fetcher<JSON = any>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<JSON> {
  const res = await fetch(input, init);

  if (!res.ok) {
    const json = await res.json();
    if (json.error) {
      const error = new Error(json.error) as Error & {
        status: number;
      };
      error.status = res.status;
      throw error;
    } else {
      throw new Error("An unexpected error occurred");
    }
  }

  return res.json();
}

export function nFormatter(num: number, digits?: number) {
  if (!num) return "0";
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "K" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item
    ? (num / item.value).toFixed(digits || 1).replace(rx, "$1") + item.symbol
    : "0";
}

export function capitalize(str: string) {
  if (!str || typeof str !== "string") return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const truncate = (str: string, length: number) => {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length)}...`;
};

const persistentFiles = new Map<string, File[]>()
const LS_TRACK_ROUTE_EDITOR___KEY = "LS_TRACK_ROUTE_EDITOR___KEY";
export class PresistFileData {
  private key = LS_TRACK_ROUTE_EDITOR___KEY
  constructor() {
    // default return value
    if (!persistentFiles.has(this.key)) {
      persistentFiles.set(this.key, [])
    }
  }
  saveData(data: File[]) {
    let files = persistentFiles.get(this.key) || []
    files = files.concat(data)
    persistentFiles.set(this.key, files)
  }
  getData(): File[] {
    return persistentFiles.get(this.key) || []
  }
  removeData(name: string) {
    let files = persistentFiles.get(this.key) || []
    files = files.filter((file) => name !== file.name)
    persistentFiles.set(this.key, files)
  }
  clear() {
    persistentFiles.set(this.key, [])
  }
}
