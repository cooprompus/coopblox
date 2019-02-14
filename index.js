const fs = require('fs');
const rbx = require("noblox.js")

const robloxId = 0
const cookie = "_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|_"

const vipFile = "vip.txt"
const friendFile = "friends.txt"
const permFile = "perm.txt"
const banFile = "ban.txt"

if(process.argv[2] === "unfriend"){
	startApp().then(() => removeFriends()).then(() => process.exit(0)).catch(console.error)
}else{
	startApp().then(() => acceptFriends()).catch(console.error)
}

async function startApp () {
	await rbx.cookieLogin(cookie)
}

function writeFriends(friends){
	const friendStream = fs.createWriteStream(friendFile, {'flags': 'a'});
	friendStream.on('error', (err) => {
		console.log('problem writing friends file')
		console.log(err)
	});
	friendStream.on('finish', () => {
		console.log("The file was saved!");
	});
	friendStream.write(',')
	friends.forEach((friend) => friendStream.write(friend + ',\n'));
	friendStream.end('')
	return friends
}

function getFriendsList(){
	return fs.readFileSync(friendFile, "utf8").split(",").map((item) => parseInt(item.trim()));
}

function getPermanentFriendsList(){
	return fs.readFileSync(permFile, "utf8").split(",").map((item) => parseInt(item.trim()));
}

function loadVips(){
	return new Promise((resolve, reject) => {
		fs.readFile(vipFile, "utf8", (err, buffer) => {
			if(err) reject(err)
			console.log(buffer)
			resolve(buffer.split(",").map((item) => parseInt(item.trim())));
		})
	})
}

function acceptFriends(){
	const onfr = rbx.onFriendRequest();
	onfr.on('data', (friendrequest) => {
		console.log(friendrequest);
		if(getPermanentFriendsList().includes(friendrequest) || getFriendsList().includes(friendrequest)){
			console.log(`accepting friend request: ${friendrequest}`)
			rbx.acceptFriendRequest(friendrequest)
		}else{
			console.log(`not accepting friend request: ${friendrequest}`)
		}
	});
	onfr.on('error', (err) =>  {
		console.error(err.stack);
	});
}

async function getFriends(){
	let result = await rbx.getFriends(robloxId, 'AllFriends')
	return result.friends.map(friend => friend.user.id)
}

function removeFriends(){
	return getFriends()
		.then(writeFriends)
		.then(removeNonVipFriends)
}

function removeNonVipFriends(friends){
	return loadVips()
		.then((vips) => {
			friends.forEach((friend) => {
				if(vips.includes(friend)){
					console.log(`not removing vip friend: ${friend}`)
				}else{
					console.log(`removing friend: ${friend}`)
					rbx.removeFriend(friend)
				}
			})
		})
}
