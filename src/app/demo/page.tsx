import { ImageUploader } from "@/components/common/image-uploader";
import ImageViewer from "@/components/common/image-viewer";
import { revalidatePath } from "next/cache";

export default async function Home() {
  const user = {
    name: "John Doe",
    image: "green_scene_copy_hgwtf0",
  };

  async function saveAvatar(url: string) {
    "use server";
    console.log("Saving avatar", url);
    // user.image = url;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    revalidatePath("/");
  }

  return (
    <main className="p-24 flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold my-12">Welcome back, {user?.name}</h1>
      <div className="flex flex-col items-center space-y-4">
        {user?.image ? (
          <ImageViewer src={user.image} alt="user" width={200} height={200} />
        ) : (
          <div className="bg-gray-300 w-72 h-72 rounded-full" />
        )}
        <div className="flex items-center justify-center gap-x-4">
          <ImageUploader onUploadSuccess={saveAvatar} />
        </div>
      </div>
    </main>
  );
}
