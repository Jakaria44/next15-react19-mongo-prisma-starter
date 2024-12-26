import { signOut } from "@/auth";
import { revalidatePath } from "next/cache";

const Logout = () => {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
        revalidatePath("/");
      }}
    >
      <button
        type="submit"
        className="bg-gray-600 text-white text-sm px-4 py-2 rounded-md cursor-pointer"
      >
        logout
      </button>
    </form>
  );
};

export default Logout;
