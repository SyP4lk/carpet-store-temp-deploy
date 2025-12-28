import { useSearchParams, usePathname, useRouter } from "next/navigation";

export function useQueryState<T extends boolean>(
  key: string,
  multiple: T,
  path?: string
): [
  T extends true ? string[] : string,
  (newValue: string) => void,
  () => void
] {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const values = (
    multiple ? searchParams.getAll(key) : searchParams.get(key) || ""
  ) as T extends true ? string[] : string;

  const setValue = (newValue: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (multiple) {
      let currentValues = searchParams.getAll(key);

      if (currentValues.includes(newValue)) {
        currentValues = currentValues.filter((v) => v !== newValue);
      } else {currentValues.push(newValue)}

      currentValues.sort();

      params.delete(key);
      currentValues.forEach((v) => params.append(key, v));
    } else {
      params.set(key, newValue);
    }

    router.push(`${path ?? pathname}?${params.toString()}`, { scroll: false });
  };

  const clearState = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`${path ?? pathname}?${params.toString()}`, { scroll: false });
  };

  return [values, setValue, clearState] as const;
}
