import {db} from "@/db";



const ListOfUsers = async () => {

	const  data= await db.user.findMany();

	return (
		<div>
			<h2>Users</h2>
			<ul>
				{data.map((user) => (
					<li key={user.id}>
						{user.email}
					</li>
				))}
			</ul>`
		</div>
	);
}

export default ListOfUsers;