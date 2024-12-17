import {db} from "@/db";


export async function getAllUsers() {
	return await db.user.findMany();
}