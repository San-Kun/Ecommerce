// ✅ BENAR (Gunakan props yang sesuai)
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const { page } = await searchParams; // Destructure page dari searchParams
  console.log(page);
}