const fs = require('fs');
const rbx = require("noblox.js")

async function startApp () {
	await rbx.cookieLogin("_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|")
}

function writeFriends(friends){
	fs.writeFile("./friends.txt", friends, (err) => {
		if(err) {
			return console.log(err);
		}
		console.log("The file was saved!");
	}); 
	return friends
}

function loadPermanentFriends(){
	permanentFriends = fs.readFileSync("./perm.txt", "utf8").split(",")
	console.log("perm:")
	console.log(permanentFriends)
}

let friends 
let permanentFriends

startApp()
	.then(() => {
		return rbx.getFriends(454258140, 'AllFriends')
	})
	.then((result) => {
		console.log("got friends!")
		//console.log(friends)
		console.log(result.friends.map(friend => friend.user.id))
		friends = result.friends.map(friend => friend.user.id)
		return friends
	})
	.then(writeFriends)
	.then((friends) => {
		friends.forEach((friend) => {
			console.log(`removing friend: ${friend}`)
			rbx.removeFriend(friend)
		})
	})
	.then(loadPermanentFriends)
	.then(() => {
		const onfr = rbx.onFriendRequest();
		onfr.on('data', (friendrequest) => {
			console.log(friendrequest);
			if(permanentFriends.includes(friendrequest) || friends.includes(friendrequest)){
				console.log(`accepting friend request: ${friendrequest}`)
				rbx.acceptFriendRequest(friendrequest)
			}
		});
		onfr.on('error', (err) =>  {
			console.error(err.stack);
		});

	})
