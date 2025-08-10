 const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { https } = require('follow-redirects');
const axios = require('axios').create({
  httpsAgent: new require('https').Agent({  
    rejectUnauthorized: false 
  })
});


// MongoDB connection setup
const mongoUri = "mongodb+srv://shivamnox1:lTIaIaJdb40irAGP@cluster0.ee6as6k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// MongoDB schema and model for users

const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  username: String,
  initialJoinDate: Date,
  lastJoinDate: Date,
  referralLink: String,
  referralsCount: { type: Number, default: 0 },
  referredBy: Number,
  watchLinksCount: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
  deletedAt: { type: Date },
  token: { type: String, default: '' },
  tokenExpires: { type: Date },
  canUseCommandUntil: { type: Date },
  isVerified: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

const fileSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  fileId: { type: String, required: true },
  type: { type: String, required: true },
  fileName: { type: String, required: true },
  caption: { type: String, default: '' },
  category: { type: String, required: true }
});

const FileModel = mongoose.model('File', fileSchema);

const puserSchema = new mongoose.Schema({
  puserId: { type: String, unique: true }, // ← Changed from String to Number
  firstName: { type: String },
  username: { type: String },
});


const P_USERS = mongoose.model('PUser', puserSchema);
const ppuserSchema = new mongoose.Schema({
  puserId: { type: String, unique: true },
  firstName: { type: String },
  username: { type: String },
  demoUsed: { type: Number, default: 0 }, // 0 for false, 1 for true
  demoStartTime: { type: Date }
});

const PP_USERS = mongoose.model('PPUser', ppuserSchema);


// Replace with your own Telegram bot token
const app = express();
// const token = '7513355237:AAEjvb6gSodWxEKjL4ftbav1zDE7MzHs3yU';
const ownerId = 1461656174;
const OWNER_ID = 1461656174;
const channelId = '-1002044705664';
const UpdateChannelId = '@Ogprimeee';
const UpdateChannelLink = 'https://t.me/Ogprimeee';
const GroupLink = 'https://t.me/hivajoymovie';
// Create a bot instance
// const bot = new TelegramBot(token, { polling: true });
const isOwner = (userId) => {
  return userId === OWNER_ID;
};
// Variable to store bot's username
let botUsername = '';

// Fetch the bot's username asynchronously to ensure it's set before use
bot.getMe().then((botInfo) => {
  botUsername = botInfo.username;  // Set the bot's username after fetching it
  console.log(`Bot username is: ${botUsername}`);
});






// Add PUser Command
bot.onText(/\/addpuser (\d+)/, async (msg, match) => {
  const userId = match[1]; // Extract userId from the message
  const chatId = msg.chat.id;

  if (chatId.toString() == OWNER_ID) {
    try {
      // Check if user already exists
      const existingUser = await P_USERS.findOne({ puserId: userId });
      if (existingUser) {
        return bot.sendMessage(chatId, `User with ID ${userId} is already added.`);
      }

      // Fetch the user details (first name) using the userId
      const user = await bot.getChat(userId); // Get user info by their ID

      // Add the new user to MongoDB with the fetched first name
      const newPUser = new P_USERS({ puserId: userId, firstName: user.first_name });
      await newPUser.save();

      bot.sendMessage(chatId, `User with ID ${userId} has been added.`);
      bot.sendMessage(userId, 
  '*🎉 Congratulations! 🎉*\n\nYou have been **promoted to a Premium User**! 🎉\n\nNow, you can easily access **Premium Content** directly! 🚀💎\n\nSend /getvideo 😎✨', 
  {parse_mode: 'Markdown'}
);


       const userToDelete = await PP_USERS.findOne({ puserId: userId });

    if (!userToDelete) {
      return bot.sendMessage(chatId, `User with ID ${userId} not found in the database.`);
    }

    // Delete the user from MongoDB
    await PP_USERS.deleteOne({ puserId: userId });

    bot.sendMessage(chatId, `User with ID ${userId} has been removed. From PPuser`);
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, 'There was an error while adding the user.');
    }
  }
});


// Remove PUser Command
bot.onText(/\/delpuser (\d+)/, async (msg, match) => {
  const userId = match[1]; // Extract userId from the message
  const chatId = msg.chat.id;

if (chatId.toString() == OWNER_ID) {
 try {
    // Find the user to delete
    const userToDelete = await P_USERS.findOne({ puserId: userId });

    if (!userToDelete) {
      return bot.sendMessage(chatId, `User with ID ${userId} not found in the database.`);
    }

    // Delete the user from MongoDB
    await P_USERS.deleteOne({ puserId: userId });

    bot.sendMessage(chatId, `User with ID ${userId} has been removed. from Puser`);
    bot.sendMessage(userId, 
  '***⏳ Oops! Your plan has expired***\n\n✨ Renew to the ***Premium Users Plan*** \n',
  {parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: '💳 View Premium Plan', callback_data: 'buyprime' }
        ]
      ]
    }
  }
);

   const existingUser = await PP_USERS.findOne({ puserId: userId });
      if (existingUser) {
        return bot.sendMessage(chatId, `User with ID ${userId} is already added.`);
      }

      // Fetch the user details (first name) using the userId
      const user = await bot.getChat(userId); // Get user info by their ID

      // Add the new user to MongoDB with the fetched first name
      const newPPUser = new PP_USERS({ puserId: userId, firstName: user.first_name, demoUsed:1 });
      await newPPUser.save();

      bot.sendMessage(chatId, `User with ID ${userId} has been added. in PPuser`);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, 'There was an error while deleting the user.');
  }
}
});


// View All PUsers Command
bot.onText(/\/pusers/, async (msg) => {
  const chatId = msg.chat.id;

  // Check if the sender is the owner
  if (chatId.toString() == OWNER_ID) {

    try {
      // Fetch all PUsers from the database
      const allPUsers = await P_USERS.find();

      if (allPUsers.length === 0) {
        return bot.sendMessage(chatId, 'No users found in the database.');
      }

      // Prepare the list of users to display with their first name
      const userList = allPUsers.map(user => {
        return `ID: ${user.puserId}, First Name: ${user.firstName || 'N/A'}`;
      }).join('\n');

      // Send the list of users
      bot.sendMessage(chatId, `List of all Pusers:\n\n${userList}`);
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, 'There was an error while fetching the user list.');
    }
  }
});

// View All PUsers Command
bot.onText(/\/ppusers/, async (msg) => {
  const chatId = msg.chat.id;

  // Check if the sender is the owner
  if (chatId.toString() == OWNER_ID) {

    try {
      // Fetch all PUsers from the database
      const allPPUsers = await PP_USERS.find();

      if (allPPUsers.length === 0) {
        return bot.sendMessage(chatId, 'No users found in the database.');
      }

      // Prepare the list of users to display with their first name
      const userList = allPPUsers.map(user => {
        return `ID: ${user.puserId}, First Name: ${user.firstName || 'N/A'}`;
      }).join('\n');

      // Send the list of users
      bot.sendMessage(chatId, `List of all PPusers:\n\n${userList}`);
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, 'There was an error while fetching the user list.');
    }
  }
});










// Function to generate a random 6-character referral code
function generateRandomReferralCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const verifyToken = async (token) => {
  try {
    const user = await User.findOne({ token });
    if (user && user.tokenExpires > new Date()) {
      return user; // Token is valid and user exists
    }
    return null; // Invalid or expired token
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
};

// Function to handle the /start command
bot.onText(/\/start(?: (.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username || "No username"; // Get the username, if available
  const referrerCode = match && match[1];  // Extract referrer code or uniqueId
  let uniqueId = referrerCode;  // If the start parameter is provided, it could be a uniqueId or referral code

  try {
    // Check if the user is already in the database
    let user = await User.findOne({ userId: String(chatId) });

    // If user doesn't exist, create a new user
    if (!user) {
      // Generate a random 6-character referral code for new users
      const referralCode = generateRandomReferralCode();  // Use the random string generator
      const referralLink = `https://t.me/${botUsername}?start=reffer_${referralCode}`;  // Generate the referral link

      // Create a new user
      user = new User({
        userId,
        username,
        initialJoinDate: new Date(),
        lastJoinDate: new Date(),
        referralLink, // Set the generated referral link here
        referralsCount: 0,  // Initially 0 referrals
        referredBy: referrerCode ? await getUserIdFromReferral(referrerCode) : null, // Set the referrer if provided
      });



      await user.save();  // Save the new user to the database
    } else {
      // Update last join date if user exists
      user.lastJoinDate = new Date();
      await user.save();
    }

    // Case 1: If the uniqueId starts with 'token_', handle token verification
    if (uniqueId && uniqueId.startsWith("token_")) {
      const token = uniqueId.split("token_")[1]; // Extract the token

      // Handle the token verification logic here
      const verifiedUser = await verifyToken(token);
      if (verifiedUser) {
        // Mark user as verified
        verifiedUser.isVerified = true;
        verifiedUser.token = ''; // Remove the token after successful verification
        verifiedUser.tokenExpires = null; // Remove the token expiration
        verifiedUser.canUseCommandUntil = new Date(Date.now() + 5 * 60 * 1000); // User can use the command for 1 minute after verification
        await verifiedUser.save();

        bot.sendMessage(chatId, "✅ Verification successful! You are now verified. Now you can use the command.");
      } else {
        bot.sendMessage(chatId, "❌ Invalid or expired token. Please try again.");
      }
    }
    // Case 2: If the uniqueId starts with 'reffer_', handle referral code logic
    else if (uniqueId && uniqueId.startsWith("reffer_")) {
    const referrerCode = uniqueId.split("reffer_")[1];

    if (referrerCode) {
        // Send a welcome message with an image and buttons
        const welcomeMessage = '👋 <b>Welcome to Our Amazing Bot!</b> 🎉\n\n' +
            'Simply send/forward me a Terabox link, and get Direct Watch/Download link instantly! 🌟📥\n\n' +
            'For <b>DIRECT 🔞ADULT VIDEO</b>\nJust type <b>/getvideo</b> and start enjoying in a flash! 🎬✨';

        const welcomeImageUrl = 'https://i.pinimg.com/originals/47/5b/59/475b59c61a6efb3ec8ac0a57e43fd03b.webp'; // Replace with an actual image URL

        const startButtons = {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: '🎬 See Channel',
                        url: 'https://t.me/Hivabyte'
                    }],
                    [{
                        text: '🔗 Share Bot',
                        callback_data: 'share_bot'  // This triggers a callback for sharing
                    }]
                ]
            }
        };

        // Send the welcome message with image and buttons
        await bot.sendPhoto(chatId, welcomeImageUrl, {
            parse_mode: 'HTML',
            caption: welcomeMessage,  // The text message
            reply_markup: startButtons.reply_markup // Attach the buttons here
        });

        // Find the user who clicked on the referral link
        const existingUser = await User.findOne({ chatId });

        if (!existingUser) {
            // If the user is not found, it means they are a new user. Let's create a new user entry.
            const referrer = await User.findOne({ referralLink: `https://t.me/${botUsername}?start=reffer_${referrerCode}` });

            if (referrer) {
                // Increment the referral count only if the user is a new user and not an existing one.
                referrer.referralsCount += 1;
                console.log(`Referrer ${referrer.username} referrals count updated to: ${referrer.referralsCount}`);
                await referrer.save(); // Save the updated referrer
            } else {
                console.log(`No referrer found for referral code: ${referrerCode}`);
            }
} else {
            // If the user already exists, we don't update the referrer count
            console.log(`User ${existingUser.username} already exists. Referrer count will not be updated.`);
        }
    }
}

    // Case 3: If the uniqueId starts with 'file_', handle file request
    else if (uniqueId && uniqueId.startsWith("file_")) {
      const models = [Parody, Viral, Webs, Fvideo];
      const uniqueID = uniqueId.split("file_")[1];

      let file = null;

      for (let model of models) {
        file = await model.findOne({ uniqueId: uniqueID });
        if (file) break; // If a match is found, break the loop
      }

      if (file) {
        // Send the file to the user
        const sentMessage = await bot.sendDocument(chatId, file.fileId, { caption: file.caption });

        // Send a warning message about file deletion
        const warningMessage = '⚠️ This file will be automatically deleted after 10 minutes. Please forward it if needed!';
      } else {
        // If the file doesn't exist, inform the user
        await bot.sendMessage(chatId, 'Sorry, the file could not be found!');
      }
      return;  // Exit early as we're handling the file request here
    }
    // Case 4: General welcome message
    else {
      // Send a welcome message with an image and buttons
      const welcomeMessage = '👋 <b>Welcome to Our Amazing Bot!</b> 🎉\n\n' +
        'Simply Send/Forward me a Terabox Link,\n\nAnd get Direct 👀 Watch | ⬇️ Download link instantly! 🌟📥\n\n';

      const aboutMessage = `
<blockquote><b>🎥 Mʏ Nᴀᴍᴇ: <a href='https://t.me/${botUsername}'>Terabox Video Player</a></b></blockquote>
<blockquote><b>👨‍💻 Cʀᴇᴀᴛᴏʀ: <a href='https://t.me/ShivamNox'>@ShivamNox</a></b></blockquote>
<blockquote><b>📚 Lɪʙʀᴀʀʏ: <a href='https://t.me/Hivabyte'>Node</a></b></blockquote>
<blockquote><b>💻 Lᴀɴɢᴜᴀɢᴇ: <a href='https://t.me/Hivabyte'>NodeJS</a></b></blockquote>
<blockquote><b>🗄️ Dᴀᴛᴀʙᴀsᴇ: <a href='https://mongodb.com'>MongoDB</a></b></blockquote>
<blockquote><b>💾 Bᴏᴛ Sᴇʀᴠᴇʀ: <a href='https://shivamnox.rf.gd'>Hivabytes</a></b></blockquote>
<blockquote><b>🔧 Bᴜɪʟᴅ Sᴛᴀᴛᴜs: <a href='https://hivajoy.free.nf'>3.6.7</a></b></blockquote>
`;
const OwnerInfo = `
<b>🌟 Oᴡɴᴇʀ Dᴇᴛᴀɪʟs 🌟</b>

<b>🧑‍💻 Nᴀᴍᴇ:</b> OG Terabox Bot

<b>📱 Tɢ Uѕᴇʀɴᴀᴍᴇ:</b> <b>@OGTERABOXBOT</b> 

<b>✨ Cᴏɴnᴇᴄᴛ tᴏ mᴏʀᴇ cʀᴇᴀᴛɪvᴇ jᴏᴜʀɴᴇʏ✨</b> 
`;

 const help = `
<b>> Play Terabox Video by Link\nExᴀᴍᴘʟᴇ: Jᴜsᴛ sᴇɴᴅ any Terabox link</b>

<b>> Get Direct Adult Video/Webseries/Movies:\nSend any Name</b>

<b>> /getvideo:\nGet Direct Video</b>

<b>> /all: See all videos from a category</b>
`;

const contactmsg = `
<blockquote><b>Nᴏᴛᴇ:</b></blockquote>
<blockquote><b>Wᴀɴᴛ A Bᴏᴛ Lɪᴋᴇ Tʜɪs:</b></blockquote>
<blockquote><b>I Wɪʟʟ Cʀᴇᴀᴛᴇ Oɴᴇ Bᴏᴛ Fᴏʀ Yᴏᴜ\nCᴏɴᴛᴀᴄᴛ tᴏ ᴛʜᴇ Dᴇvᴇʟᴏpᴇʀ</b></blockquote>
`;

      const welcomeImageUrl = 'https://i.pinimg.com/originals/47/5b/59/475b59c61a6efb3ec8ac0a57e43fd03b.webp'; // Replace with an actual image URL

      const startButtons = {
        reply_markup: {
          inline_keyboard: [
            [{
              text: '🎬 See Channel',
              url: 'https://t.me/Hivabyte'
            }],
            [{
              text: '🔗 Share Bot',
              callback_data: 'share_bot'  // This triggers a callback for sharing
            }]
          ]
        }
      };

      await bot.sendPhoto(chatId, welcomeImageUrl, { 
  caption: welcomeMessage, 
  parse_mode: 'HTML', 
  reply_markup: {
    inline_keyboard: [
      [
        { text: '🍂 Uᴘᴅᴀᴛᴇs 🍂', url: `${UpdateChannelLink}` },
        { text: '🫨 Mᴏᴠɪᴇ Gʀᴏᴜᴘ', url: `${UpdateChannelLink}` }
      ],
      [
        { text: 'Hᴇʟᴘ', callback_data: 'help' },
        { text: 'Aʙᴏᴜᴛ', callback_data: 'about' }
      ]
    ]
  }
});


      // Listen for callback query to show the About message or go back
bot.on('callback_query', (query) => {
  const messageId = query.message.message_id;
  const chatId = query.message.chat.id;

  if (query.data === 'contactmsg') {
    // New image URL for the "About" message
    const imageUrl = 'https://img.freepik.com/premium-photo/friendly-positive-cute-cartoon-steel-robot-with-smilinggenerative-ai_861549-3002.jpg'; // Image for About

    // Edit the message to show the About message along with the new image
    bot.editMessageMedia({
      type: 'photo',
      media: imageUrl,
      caption: contactmsg, // The updated caption with the About information
      parse_mode: 'HTML'
    }, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: [
          [
            { text: 'Cᴏɴᴛᴀᴄᴛ', url: 'https://t.me/ogelite' },
            { text: '⬅️ Bᴀᴄᴋ', callback_data: 'about' }
          ]
        ]
      }
    });
  }

  if (query.data === 'help') {
    // New image URL for the "About" message
    const imageUrl = 'https://img.freepik.com/premium-photo/friendly-positive-cute-cartoon-steel-robot-with-smilinggenerative-ai_861549-3002.jpg'; // Image for About

    // Edit the message to show the About message along with the new image
    bot.editMessageMedia({
      type: 'photo',
      media: imageUrl,
      caption: help, // The updated caption with the About information
      parse_mode: 'HTML'
    }, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: [
          [

            { text: '⬅️ Bᴀᴄᴋ', callback_data: 'back' }
          ]
        ]
      }
    });
  }

  if (query.data === 'ownerinfo') {
    // New image URL for the "About" message
    const imageUrl = 'https://img.freepik.com/premium-photo/friendly-positive-cute-cartoon-steel-robot-with-smilinggenerative-ai_861549-3002.jpg'; // Image for About

    // Edit the message to show the About message along with the new image
    bot.editMessageMedia({
      type: 'photo',
      media: imageUrl,
      caption: OwnerInfo, // The updated caption with the About information
      parse_mode: 'HTML'
    }, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: [
          [

            { text: '⬅️ Bᴀᴄᴋ', callback_data: 'about' }
          ]
        ]
      }
    });
  }

  if (query.data === 'about') {
    // New image URL for the "About" message
    const imageUrl = 'https://img.freepik.com/premium-photo/friendly-positive-cute-cartoon-steel-robot-with-smilinggenerative-ai_861549-3002.jpg'; // Image for About

    // Edit the message to show the About message along with the new image
    bot.editMessageMedia({
      type: 'photo',
      media: imageUrl,
      caption: aboutMessage, // The updated caption with the About information
      parse_mode: 'HTML'
    }, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
       inline_keyboard: [
          [
            { text: '👨‍💻 Oᴡɴᴇʀ Iɴfᴏ', callback_data: 'ownerinfo' },
            { text: 'Sᴏᴜʀᴄᴇ Cᴏᴅᴇ', callback_data: 'contactmsg' }
          ],
          [ { text: '⬅️ Bᴀᴄᴋ', callback_data: 'back' }]
        ]
      }
    });
  }

  if (query.data === 'back') {
    // Revert back to the original greeting image and message
    bot.editMessageMedia({
      type: 'photo',
      media: welcomeImageUrl, // The same image as the original one
      caption: welcomeMessage, // The original greeting caption
      parse_mode: 'HTML'
    }, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
        inline_keyboard: [

          [
            { text: '🍂 Uᴘᴅᴀᴛᴇs 🍂', url: `${UpdateChannelLink}` },
            { text: '🫨 Mᴏᴠɪᴇ Gʀᴏᴜᴘ', url: `${UpdateChannelLink}` }
          ],
          [
            { text: 'Hᴇʟᴘ', callback_data: 'help' },
            { text: 'Aʙᴏᴜᴛ', callback_data: 'about' }
          ]
        ]
      }
    });
  } 

  if (query.data === 'buy') {
    // Edit the message to show the About message along with the new image
    bot.editMessageMedia({
      type: 'photo',
      media: welcomeImageUrl,
      caption: buypremium, // The updated caption with the About information
      parse_mode: 'HTML'
    }, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: {
       inline_keyboard: [
  [
    { text: 'Sᴇɴᴅ Yᴏᴜʀ Pᴀʏᴍᴇɴᴛ Rᴇᴄᴇɪᴘᴛ Hᴇʀᴇ', url: 'https://t.me/shivamnox' },
    ],[{ text: '⬅️ Bᴀᴄᴋ', callback_data: 'back' }
  ]
]

      }
    });
  }

  // Answer the callback query to remove the loading animation on the button
  bot.answerCallbackQuery(query.id);
});


    }
  } catch (error) {
    console.error('Error processing /start command:', error);
    await bot.sendMessage(chatId, '❌ An error occurred. Please try again later.');
  }
});



  const imageUrl = 'https://img.freepik.com/premium-photo/friendly-positive-cute-cartoon-steel-robot-with-smilinggenerative-ai_861549-3002.jpg'; // Image for About
  const buypremium = `
<blockquote><b>Hᴇʏ Pʀᴇᴍɪᴜᴍ Pʟᴀɴ</b></blockquote>\n
<blockquote><b>Pʀᴇᴍɪᴜᴍ Fᴇᴀᴛᴜʀᴇs</b></blockquote>
<blockquote><b>Wɪᴛʜᴏᴜᴛ ᴀᴅs\nNᴏ vᴇʀɪғɪᴄᴀᴛɪᴏɴ\nDɪʀᴇᴄᴛ Adult Videos\nAdult Webseries, Viral/Onlyfan Videos, Parody Movies, Full Videos, Desi Videos\nDirect Search by name\nCan use /getvideo and /all Command.</b></blockquote>\n
<blockquote><b>ᴀʟʟ Pʀɪᴄᴇ Lɪsᴛ</b></blockquote>
<blockquote><b>Rs10 - 1 Wᴇᴇᴋ\nRs30 - 1 Mᴏɴᴛʜ\nRs60 - 2 Mᴏɴᴛʜs\nRs90 - 3 Mᴏɴᴛʜs\nRs120 - 7 Mᴏɴᴛʜs</b></blockquote>\n
<blockquote><b>UPI ID -</b> yadavk4426-1@oksbi</blockquote>
<blockquote><b>Contact -</b> @OGHomeLanderr</blockquote>
<blockquote><b>Sᴇɴᴅ SS Aғᴛᴇʀ Pᴀʏᴍᴇɴᴛ</b></blockquote>
`;

// Handle /plan command
bot.onText(/\/plan/, (msg) => {
  const chatId = msg.chat.id;

  // Edit the message to show the About message along with the new image
  bot.sendPhoto(chatId, imageUrl, {
    caption: `${buypremium}`,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Sᴇɴᴅ Yᴏᴜʀ Pᴀʏᴍᴇɴᴛ Rᴇᴄᴇɪᴘᴛ Hᴇʀᴇ', url: 'https://t.me/oghomelanderr' }
        ],
        [
          { text: 'Delete', callback_data: 'delete_plan_message' }
        ]
      ]
    }
  });
});

  // Handle callback queries from the inline buttons
bot.on('callback_query', (query) => {
  const messageId = query.message.message_id;
  const chatId = query.message.chat.id;

  if (query.data === 'delete_plan_message') {
    // Delete the message when 'Delete' is clicked
    bot.deleteMessage(chatId, messageId)
      .then(() => {
      })
      .catch((error) => {
        console.error('Error deleting message:', error);
      });
  }
  if (query.data === 'buyprime') {
      // Edit the message to show the About message along with the new image
  bot.sendPhoto(chatId, imageUrl, {
    caption: `${buypremium}`,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          { text: 'Sᴇɴᴅ Yᴏᴜʀ Pᴀʏᴍᴇɴᴛ Rᴇᴄᴇɪᴘᴛ Hᴇʀᴇ', url: 'https://t.me/shivamnox' }
        ],
        [
          { text: 'Delete', callback_data: 'delete_plan_message' }
        ]
      ]
    }
  });
    }
});




// Function to get userId from referral code
async function getUserIdFromReferral(referralCode) {
  try {
    const user = await User.findOne({ referralLink: `https://t.me/${botUsername}?start=${referralCode}` });
    return user ? user.userId : null;
  } catch (error) {
    console.error('Error fetching user by referral code:', error);
    return null;
  }
}



// Function to handle the /mydash command
bot.onText(/\/mydash/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id; // The user's unique Telegram ID

  try {
    // Fetch the user from the database
    const user = await User.findOne({ userId });

    if (!user) {
      bot.sendMessage(chatId, '❌ You are not registered in the system. Please start by sending /start to register.');
      return;
    }



    let rewardsMessage = '';
      if (user.referralsCount >= 100) {
        rewardsMessage = `
🎉 <b>Congratulations!</b> You’ve earned 20 links per day with 10 or more referrals! 🚀
        `;
      } else if (user.referralsCount >= 50) {
        rewardsMessage = `
🎉 <b>Great Job!</b> You’ve earned 15 links per day with 5 or more referrals! 🌟
        `;
      } else {
        rewardsMessage = `
👀 Keep inviting friends! You’re on your way to unlocking great rewards! 🎁\n\nComing Soon... 🌟
        `;
      }

// Prepare the user dashboard with the details
const userDashboard = `
🌟 <b>Welcome to Your Dashboard, ${user.username}!</b> 🌟

━━━━━━━━━━━━━━━━━━━━━━━━
<b>👤 Profile Information</b>
━━━━━━━━━━━━━━━━━━━━━━━━
<blockquote>- <b>Username:</b> ${user.username}
- <b>User ID:</b> ${user.userId}
- <b>Joined On:</b> ${user.initialJoinDate.toLocaleString()}
- <b>Last Login:</b> ${user.lastJoinDate.toLocaleString()}</blockquote>

━━━━━━━━━━━━━━━━━━━━━━━━
<b>📈 Referral Statistics</b>
━━━━━━━━━━━━━━━━━━━━━━━━
<blockquote>- <b>Referrals Count:</b> ${user.referralsCount} 
${rewardsMessage}
✨ Invite friends to increase your referrals and unlock rewards!</blockquote>

━━━━━━━━━━━━━━━━━━━━━━━━
<b>🔗 Watch Links Overview</b>
━━━━━━━━━━━━━━━━━━━━━━━━
<blockquote>- <b>Links Generated:</b> ${user.watchLinksCount}  
🚀 Keep generating more links and boost your rewards!</blockquote>

━━━━━━━━━━━━━━━━━━━━━━━━
<blockquote><b>🎉 Thank you for being a valued member!</b></blockquote>
`;




// Example: Sending this message in a Telegram bot
bot.sendMessage(chatId, userDashboard, { parse_mode: 'HTML' });


  } catch (error) {
    console.error('Error processing /mydash command:', error);
    bot.sendMessage(chatId, '❌ An error occurred while fetching your dashboard. Please try again later.');
  }
});



// Handle the callback queries (View Rewards, Share, etc.)
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const userId = callbackQuery.from.id;
  const callbackData = callbackQuery.data;

  try {
    // Fetch the user details to get the referral link
    const user = await User.findOne({ userId });

    if (!user) {
      return bot.sendMessage(chatId, '❌ You are not registered. Please send /start to register.');
    }

    // Check if the callback data is 'view_rewards'
    if (callbackQuery.data === 'view_rewards') {
      // Prepare the rewards message based on referral count
      let rewardsMessage = '';
      if (user.referralsCount >= 100) {
        rewardsMessage = `
🎉 <b>Congratulations!</b> You’ve earned 20 links per day with 10 or more referrals! 🚀
        `;
      } else if (user.referralsCount >= 50) {
        rewardsMessage = `
🎉 <b>Great Job!</b> You’ve earned 15 links per day with 5 or more referrals! 🌟
        `;
      } else {
        rewardsMessage = `
👀 Keep inviting friends! You’re on your way to unlocking great rewards! 🎁\n\nComing Soon... 🌟
        `;
      }

      // Edit the message to show rewards info and the Back button
      await bot.editMessageText(rewardsMessage, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🔙 Back to Share',
                callback_data: 'back_to_share', // Go back to share message
              },
            ],
          ],
        },
      });
    }

    // Check if the callback data is 'back_to_share'
    else if (callbackQuery.data === 'back_to_share') {
      // Prepare the original referral message
      const referMessage = `
🎉 <b>Your Exclusive Referral Link:</b>
👉 ${user.referralLink}

🚀 <b>Invite Your Friends and Earn Amazing Rewards!</b>
The more you share, the more you earn! 💰

📊 <b>Total Referrals:</b> ${user.referralsCount}

Start sharing now and watch your rewards grow! 🌟
      `;

      // Edit the message back to the original share message (without Back button)
      await bot.editMessageText(referMessage, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📤 Share with Friends',
                switch_inline_query: referMessage, // Allows sharing via inline
              },
            ],
            [
              {
                text: '🎁 View Rewards',
                callback_data: 'view_rewards', // Show rewards info
              },
            ],
          ],
        },
      });
    }

    // Check if the callback data is 'share_bot'
    else if (callbackData === 'share_bot') {

       // Prepare the referral message
      const referMessage = `
🎉 <b>Your Exclusive Referral Link:</b>
👉 ${user.referralLink}

🚀 <b>Invite Your Friends and Earn Amazing Rewards!</b>
The more you share, the more you earn! 💰

📊 <b>Total Referrals:</b> ${user.referralsCount}

Start sharing now and watch your rewards grow! 🌟
      `;
 // Send the referral message with inline buttons
      await bot.sendMessage(chatId, referMessage, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📤 Share with Friends',
                switch_inline_query: referMessage, // Allows sharing via inline
              },
            ],
            [
              {
                text: '🎁 View Rewards',
                callback_data: 'view_rewards', // Show rewards info
              },
            ],
          ],
        },
      });

    }
  } catch (error) {
    console.error('Error handling callback query:', error);
    bot.sendMessage(chatId, '❌ An error occurred while processing your request. Please try again later.');
  }
});





// Handle the /refer command
bot.onText(/\/refer/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    // Fetch the user details to get the referral link
    const user = await User.findOne({ userId });

    if (!user) {
      return bot.sendMessage(chatId, '❌ You are not registered. Please send /start to register.');
    }

    // Make sure botUsername is populated
    if (!botUsername) {
      return bot.sendMessage(chatId, '❌ Unable to fetch bot username. Please try again later.');
    }

    // Prepare the referral message
    const referMessage = `
🎉 <b>Your Exclusive Referral Link:</b>
👉 ${user.referralLink}

🚀 <b>Invite Your Friends and Earn Amazing Rewards!</b>
The more you share, the more you earn! 💰

📊 <b>Total Referrals:</b> ${user.referralsCount}

Start sharing now and watch your rewards grow! 🌟
    `;

    // Send the referral message with inline buttons
    await bot.sendMessage(chatId, referMessage, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📤 Share with Friends',
              switch_inline_query: referMessage, // Allows sharing via inline
            },
          ],
          [
            {
              text: '🎁 View Rewards',
              callback_data: 'view_rewards', // Show rewards info
            },
          ],
        ],
      },
    });

  } catch (error) {
    console.error('Error handling /refer command:', error);
    bot.sendMessage(chatId, '❌ An error occurred while processing your request. Please try again later.');
  }
});






async function checkChannelMembership(userId, UpdateChannelId) {
  try {
    const member = await bot.getChatMember(UpdateChannelId, userId); // Use channelId instead of @channelUsername
    return member.status === 'member' || member.status === 'administrator' || member.status === 'creator';
  } catch (error) {
    console.error("Error checking membership:", error);
    return false;
  }
}




function sendJoinChannelMessage(chatId) {
  bot.sendMessage(chatId, `✨ Fɪʀsᴛ Jᴏɪɴ pᴜᴘᴅᴀᴛᴇs Cʜᴀɴɴᴇʟ/Group @Ogprimeee, To use this bot.`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '👉 Jᴏɪɴ Nᴏᴡ', url: `${UpdateChannelLink}` }]
      ]
    }
});

}



bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const caption = msg.text;

  // Ensure message has sender info
  if (!msg.from || !msg.from.id) {
    console.warn('Message does not contain sender info. Ignoring.');
    return;
  }

  const userId = msg.from.id;
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
  const isPrivate = msg.chat.type === 'private';

  // Ignore commands
  if (typeof caption === 'string' && caption.startsWith('/')) return;

  // In private chat, check channel membership
  if (isPrivate || isGroup) {
    const isMember = await checkChannelMembership(chatId, UpdateChannelId);
    if (!isMember) return sendJoinChannelMessage(chatId);
  }

  try {
    const user = await User.findOne({ userId });
    const puser = await P_USERS.findOne({ puserId: userId });
    const isPuser = !!puser;
    const canUseCommand = user?.canUseCommandUntil > new Date();

    console.log(`UserId: ${userId} (type: ${typeof userId})`);
    console.log(`isPuser: ${isPuser}`);
    console.log(`canUseCommand: ${canUseCommand}`);

    if (!caption) return;

    // ✅ PRIVATE CHAT
    if (isPrivate) {
      if (isPuser || canUseCommand) {
        console.log('Private chat: calling handleCaption');
        return handleCaption(msg, chatId, caption, isPuser);
      } else {
        console.log('Private chat: user needs verification');
        return handleverification(chatId, userId);
      }
    }

    // ✅ GROUP CHAT
    if (isGroup) {
      if (isPuser || canUseCommand) {
        console.log('Group chat: calling handleCaption2');
        return handleCaption2(msg, chatId, caption, isPuser);
      } else {
        console.log('Group chat: user not authorized. Ignoring.');
        // Optional: send message or just ignore
        return handleverification(chatId, userId);
      }
    }

  } catch (error) {
    console.error('Error in message handler:', error);
  }
});





// Store the user's photo activity with timestamps and the time of last limit exceedance
const userPhotoCount = {};

// Helper function to check and update the photo limit
const checkPhotoLimit = (userId) => {
  const currentTime = Date.now();
  if (!userPhotoCount[userId]) {
    userPhotoCount[userId] = { timestamps: [], lastExceeded: null };
  }

  // Filter out photos that are older than 1 minute (60000 milliseconds)
  userPhotoCount[userId].timestamps = userPhotoCount[userId].timestamps.filter(timestamp => currentTime - timestamp < 60000);

  // Check if the user has sent more than 5 photos in the last minute
  if (userPhotoCount[userId].timestamps.length >= 5) {
    // Set the time when the user exceeded the limit
    if (!userPhotoCount[userId].lastExceeded) {
      userPhotoCount[userId].lastExceeded = currentTime;
    }
    return false; // Exceeded limit
  }

  // Otherwise, add the current timestamp
  userPhotoCount[userId].timestamps.push(currentTime);
  return true;
};

// Handle photo (image) files
bot.on('photo', async (msg) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const caption = msg.caption;

  // Check if the user exceeds the photo sending limit
  if (!checkPhotoLimit(userId)) {
    // Calculate the remaining time until the user can send another photo
    const currentTime = Date.now();
    const lastExceeded = userPhotoCount[userId].lastExceeded;
    const elapsedTime = currentTime - lastExceeded;

    // Calculate the remaining time (ensure it's not negative)
    const remainingTime = Math.max(0, 60000 - elapsedTime);

    // Convert remaining time to seconds
    const remainingSeconds = Math.ceil(remainingTime / 1000);

    // Send a message notifying the user about the limit and the remaining time
    bot.sendMessage(chatId, `You can only send 5 post per minute.\n\nPlease try again in ${remainingSeconds} sec.`);
    return; // Exit the function without processing the photo
  }

  // Process the caption if there is one
  if (caption) {
    handleCaption(msg, chatId, caption);
  }
});





async function getFastStreamUrl(link) {
  // https://teraplay.me/api/get-api.php
  const url = 'https://api.iteraplay.com/';

  const payload = { link };

  const headers = {
    'accept': '*/*',
    'accept-encoding': 'gzip, deflate, br, zstd',
    'accept-language': 'en-US,en;q=0.9',
    'content-type': 'application/json',
    'origin': 'https://teraplay.me',
    'referer': 'https://teraplay.me/',
    'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Microsoft Edge";v="138"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'cross-site',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
    'x-api-key': 'fileszero_owner_api_kharidle_kab_tak_scrap_karte_rahoge_contact_me_whatsapp_9031063699'
  };

  try {
    const response = await axios.post(url, payload, { headers });
    const file = response.data?.list?.[0];

    if (!file || !file.fast_stream_url) {
      throw new Error('No stream URL found in the response.');
    }

    return file.fast_stream_url;
  } catch (error) {
    console.error('Failed to get fast stream URL:', error.response?.data || error.message);
    throw error;
  }
}


// Function to handle captions
async function handleCaption(msg, chatId, caption, isPuser) {
  const userId = msg.from.id; // The user's unique Telegram ID
  let text = caption; // Let allows reassignment

  try {
    let user = await User.findOne({ userId });

    // Forward the message to the channel
    const botInfo = await bot.getMe();
    const botUsername = botInfo.username;

    console.log(`Forwarded message from @${msg.from.username} to the channel via @${bot.username}`);

    // Check if the message contains a valid URL
    if (text && text.match(/https?:\/\/\S+/)) {
      user = await User.findOne({ userId });

      // ✅ Updated: P_USERS don't need registration check
      if (!user && !isPuser) {
        await bot.sendMessage(chatId, '❌ You are not registered. Please send /start to register.');
        return;
      }

      // Check for TeraBox specific URL
      const teraboxRegex = /https?:\/\/([a-zA-Z0-9_-]+\.)?[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\/wap\/share\/filelist\?surl=([a-zA-Z0-9_-]+)/;
      const teraboxMatch = text.match(teraboxRegex);

      if (teraboxMatch) {
        // Extract the ID from the `surl` parameter (captured group 2)
        const surlId = teraboxMatch[2];
        // Convert the TeraBox URL to the required format
        const fullUrl = `https://teraboxapp.com/s/1${surlId}`;
        // Replace the original URL with the new one
        text = fullUrl;
      }

      // Define regex to match any URL containing "/s/" (after the domain)
      const urlRegex = /https?:\/\/([a-zA-Z0-9.-]+\/s\/[a-zA-Z0-9_-]+)/;
      const match = text.match(urlRegex);

      if (match) {
        // ✅ Updated: Only increment watchLinksCount for regular users, not P_USERS
        if (user && !isPuser) {
          user.watchLinksCount += 1;
          await user.save();
        }

        const fullUrl = match[0]; // The matched URL
        const urlid = fullUrl.split('/s/')[1]; // Extract the ID after '/s/'
        const slicedId = urlid.slice(1); // Remove the first character of the ID
        const { saveHash } = require('./hashstore');
        saveHash(slicedId);

        const generatingMessage = await bot.sendMessage(chatId, '🔄 Generating, Please Wait...', { reply_to_message_id: msg.message_id });
        const stlink = `https://terabox.com/s/${urlid}`;
        const fastStream = await getFastStreamUrl(stlink);

        try {
          const mdiskimg = `https://core.mdiskplay.com/images-tb/${slicedId}.jpg`;
          const fallbackImage = 'https://images.techhive.com/images/article/2017/04/thinkstock-videoplayer-100717884-large.jpg';

          const imageUrl = fallbackImage;
          const fastStreamUrl = encodeURIComponent(fastStream);
          const hivajoysetup = `https://hivajoy-terabox.blogspot.com/?streamlink=${fastStreamUrl}`;
          const webwatch = `https://og-terabox-player.onrender.com/watch?streamlink=${fastStreamUrl}`;

          await bot.sendPhoto(
            chatId,
            imageUrl,
            {
              caption: `<b>Watch On Web</b>: <a href="${webwatch}">WATCH NOW</a> \n\nYour Watch Link is Ready.`,
              parse_mode: 'HTML',
              reply_to_message_id: msg.message_id,
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: '⚡ 1.Watch Now',
                      web_app: { url: hivajoysetup },
                    },
                  ],
                  [
                    {
                      text: '⚡ 2.Web Watch',
                      url: webwatch,
                    },
                  ]
                ],
              },
            }
          );

          await bot.deleteMessage(chatId, generatingMessage.message_id);
        } catch (error) {
          console.error('Error accessing the API:', error);
          await bot.deleteMessage(chatId, generatingMessage.message_id);

          // Send the generated links as a reply
          await bot.sendMessage(
            chatId,
            `ERROR: ${error}`,
            {
              parse_mode: 'HTML',
              reply_to_message_id: msg.message_id,
            }
          );
        }
      } else {
        await bot.sendMessage(chatId, '⚠️ Please send a valid Terabox URL that contains.\n\n📜 Example: `https://teraboxapp.com/s/1Hia89nsiwunsn`');
      }
    } else if (text.startsWith('/')) {
      return;
    }
  } catch (error) {
    console.error('Error processing incoming message:', error);
  }
}

// Function to handle captions
async function handleCaption2(msg, chatId, caption, isPuser) {
  const userId = msg.from.id; // The user's unique Telegram ID
  let text = caption; // Let allows reassignment

  try {
    let user = await User.findOne({ userId });

    // Forward the message to the channel
    const botInfo = await bot.getMe();
    const botUsername = botInfo.username;

    console.log(`Forwarded message from @${msg.from.username} to the channel via @${bot.username}`);

    // Check if the message contains a valid URL
    if (text && text.match(/https?:\/\/\S+/)) {
      user = await User.findOne({ userId });

      // ✅ Updated: P_USERS don't need registration check
      if (!user && !isPuser) {
        await bot.sendMessage(chatId, '❌ You are not registered. Please send /start to register.');
        return;
      }

      // Check for TeraBox specific URL
      const teraboxRegex = /https?:\/\/([a-zA-Z0-9_-]+\.)?[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\/wap\/share\/filelist\?surl=([a-zA-Z0-9_-]+)/;
      const teraboxMatch = text.match(teraboxRegex);

      if (teraboxMatch) {
        // Extract the ID from the `surl` parameter (captured group 2)
        const surlId = teraboxMatch[2];
        // Convert the TeraBox URL to the required format
        const fullUrl = `https://teraboxapp.com/s/1${surlId}`;
        // Replace the original URL with the new one
        text = fullUrl;
      }

      // Define regex to match any URL containing "/s/" (after the domain)
      const urlRegex = /https?:\/\/([a-zA-Z0-9.-]+\/s\/[a-zA-Z0-9_-]+)/;
      const match = text.match(urlRegex);

      if (match) {
        // ✅ Updated: Only increment watchLinksCount for regular users, not P_USERS
        if (user && !isPuser) {
          user.watchLinksCount += 1;
          await user.save();
        }

        const fullUrl = match[0]; // The matched URL
        const urlid = fullUrl.split('/s/')[1]; // Extract the ID after '/s/'
        const slicedId = urlid.slice(1); // Remove the first character of the ID
        const { saveHash } = require('./hashstore');
        saveHash(slicedId);

        const generatingMessage = await bot.sendMessage(chatId, '🔄 Generating, Please Wait...', { reply_to_message_id: msg.message_id });
        const stlink = `https://terabox.com/s/${urlid}`;
        const fastStream = await getFastStreamUrl(stlink);

        try {
          const mdiskimg = `https://core.mdiskplay.com/images-tb/${slicedId}.jpg`;
          const fallbackImage = 'https://images.techhive.com/images/article/2017/04/thinkstock-videoplayer-100717884-large.jpg';

          const imageUrl = fallbackImage;
          const fastStreamUrl = encodeURIComponent(fastStream);
          const hivajoysetup = `https://hivajoy-terabox.blogspot.com/?streamlink=${fastStreamUrl}`;
          const webwatch = `https://og-terabox-player.onrender.com/watch?streamlink=${fastStreamUrl}`;

          await bot.sendPhoto(
            chatId,
            imageUrl,
            {
              caption: `<b>Watch On Web</b>: <a href="${webwatch}">WATCH NOW</a> \n\nYour Watch Link is Ready.`,
              parse_mode: 'HTML',
              reply_to_message_id: msg.message_id,
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: '⚡ 2.Web Watch',
                      url: webwatch,
                    },
                  ]
                ],
              },
            }
          );

          await bot.deleteMessage(chatId, generatingMessage.message_id);
        } catch (error) {
          console.error('Error accessing the API:', error);
          await bot.deleteMessage(chatId, generatingMessage.message_id);

          // Send the generated links as a reply
          await bot.sendMessage(
            chatId,
            `ERROR: ${error}`,
            {
              parse_mode: 'HTML',
              reply_to_message_id: msg.message_id,
            }
          );
        }
      } else {
        await bot.sendMessage(chatId, '⚠️ Please send a valid Terabox URL that contains.\n\n📜 Example: `https://teraboxapp.com/s/1Hia89nsiwunsn`');
      }
    } else if (text.startsWith('/')) {
      return;
    }
  } catch (error) {
    console.error('Error processing incoming message:', error);
  }
}


const fetch = require('node-fetch');

// Generate a random token (if needed)
const generateToken = () => crypto.randomBytes(4).toString('hex');

// Main function to shorten URL with inshorturl.com
const shortenUrlWithhjlink = async (longUrl) => {
  const apiKey = '3d3360d80cfff24abc0ece738ee696056d6dfadb';
  const apiUrl = `https://inshorturl.com/api?url=${encodeURIComponent(longUrl)}&api=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    if (result.shortenedUrl || result.shorturl) {
      // Adjust based on actual API response format
      return result.shortenedUrl || result.shorturl;
    } else {
      throw new Error('Shortened URL not found in API response.');
    }
  } catch (error) {
    console.error('Error shortening URL with inshorturl.com:', error);
    return null;
  }
};









// Function to handle the /stats command (only for bot owner)
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // Replace with the actual owner userId
    // Replace with actual owner ID

  if (userId !== ownerId) {
    return bot.sendMessage(chatId, '❌ You are not authorized to view this information.');
  }

  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ lastJoinDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } });  // Users who joined in the last 30 days
    const deletedAccounts = await User.countDocuments({ deletedAt: { $ne: null } });
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    // Aggregate the total watch links generated across all users
    const totalWatchLinks = await User.aggregate([
      { $group: { _id: null, totalWatchLinks: { $sum: "$watchLinksCount" } } }
    ]);


   const statsMessage = `
      🌟 <b>✨ Bot Usage Statistics ✨</b> 🌟

      <b>📊 Total Users:</b> <i>${totalUsers}</i>
      <b>🔥 Active Users (Last 30 days):</b> <i>${activeUsers}</i>
      <b>❌ Deleted Accounts:</b> <i>${deletedAccounts}</i>
      <b>🚫 Blocked Users:</b> <i>${blockedUsers}</i>

      <b>🔗 Total Watch Links Generated:</b> <i>${totalWatchLinks[0]?.totalWatchLinks || 0}</i>
    `;

    bot.sendMessage(chatId, statsMessage, { parse_mode: 'HTML' });
  } catch (error) {
    console.error('Error processing /stats command:', error);
    bot.sendMessage(chatId, '❌ An error occurred while fetching statistics. Please try again later.');
  }
});






// Broadcast command
bot.onText(/\/broadcast/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isOwner(userId)) {
    return bot.sendMessage(chatId, '❌ You are not authorized to use this command.');
  }

  // Check if the message is a reply to another message (either text, photo, or video)
  if (msg.reply_to_message) {
    const broadcastMessage = msg.reply_to_message;
    let broadcastType = '';

    if (broadcastMessage.photo) {
      broadcastType = 'photo';
    } else if (broadcastMessage.video) {
      broadcastType = 'video';
    } else if (broadcastMessage.text) {
      broadcastType = 'text';
    } else {
      return bot.sendMessage(chatId, '❌ Unsupported media type for broadcasting.');
    }

    bot.sendMessage(chatId, '📢 Broadcast started! Sending messages...');

    // Get all users from the database
    const users = await User.find();
    let sentCount = 0;
    let failedCount = 0;

    // Track users who have already received the message
    const sentUsers = new Set();  // This will store user IDs to avoid sending multiple times

    // Send initial broadcast progress message
    let progressMessage = await bot.sendMessage(chatId, `📢 Broadcast Progress Update:\n\n✅ Sent to: ${sentCount} users\n❌ Failed to send to: ${failedCount} users`);

    // Function to send the broadcast message and track progress
    const sendBroadcast = async () => {
      for (const user of users) {
        if (sentUsers.has(user.userId)) {
          continue;  // Skip users who have already received the broadcast
        }

        try {
          if (broadcastType === 'photo') {
            await bot.sendPhoto(user.userId, broadcastMessage.photo[0].file_id, { caption: broadcastMessage.caption });
          } else if (broadcastType === 'video') {
            await bot.sendVideo(user.userId, broadcastMessage.video.file_id, { caption: broadcastMessage.caption });
          } else if (broadcastType === 'text') {
            await bot.sendMessage(user.userId, broadcastMessage.text);
          }
          sentCount++;
          sentUsers.add(user.userId);  // Add user to the sentUsers set
        } catch (err) {
          failedCount++;
        }

        // Update the progress message
        await bot.editMessageText(
          `📢 Broadcast Progress Update:\n\n✅ Sent to: ${sentCount} users\n❌ Failed to send to: ${failedCount} users`,
          {
            chat_id: chatId,
            message_id: progressMessage.message_id
          }
        );
      }

      // After all users are processed, send the final report
      bot.editMessageText(
        `✅ Broadcast complete!\nSent to: ${sentCount} users\nFailed to send to: ${failedCount} users.`,
        {
          chat_id: chatId,
          message_id: progressMessage.message_id
        }
      );
    };

    // Start broadcasting with real-time updates
    sendBroadcast();
  } else {
    bot.sendMessage(chatId, '❌ Please reply to a message or media that you want to broadcast.');
  }
});



async function handleverification(chatId, userId) {
  const waitmsg = await bot.sendMessage(chatId, 'Generating');
  const user = await User.findOne({ userId });
  // Generate a new token and short URL for verification
  const token = generateToken();
  user.token = token;
  user.tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token expires in 1 day
  await user.save();

  const longUrl = `https://t.me/${botUsername}?start=token_${token}`;
  const shortUrl = await shortenUrlWithhjlink(longUrl);

  if (shortUrl) {
    bot.sendMessage(chatId, `Yᴏᴜʀ Aᴄᴄᴇss Tᴏkᴇɴ hᴀs ᴇxpɪʀᴇᴅ. Pʟᴇᴀsᴇ rᴇnᴇw ɪᴛ ᴀɴᴅ tʀʏ ᴀɢᴀɪɴ.

<b>Tᴏkᴇɴ Vᴀlɪᴅɪᴛʏ</b>: 1 Day

Tʜɪs ɪs ᴀɴ ᴀds-bᴀsᴇd ᴀcᴄᴇss tᴏkᴇɴ. Iғ yᴏᴜ pᴀss 1 ᴀcᴄᴇss tᴏkᴇɴ, yᴏᴜ cᴀɴ ᴀcᴄᴇss mᴇssᴀɢᴇs fʀᴏᴍ sʜᴀʀᴀʙʟᴇ lɪɴᴋs fᴏʀ ᴛʜᴇ nᴇxt 1 Day.`,
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Vᴇʀɪfʏ', url: shortUrl }, { text: 'Hᴏw tᴏ Vᴇʀɪfʏ', url: `https://t.me/hivajk/23` }],
          [
            { text: 'Bᴜʏ Pʀᴇᴍɪᴜᴍ | Rᴇmᴏᴠᴇ ᴀᴅs', callback_data: 'buyprime' }
          ]
        ]
      }
    });
  } else {
    bot.sendMessage(chatId, 'Eʀʀᴏʀ ɢᴇɴᴇʀᴀᴛɪɴɢ sʜᴏʀᴛᴇɴᴇᴅ ᴜʀʟ. Pʟᴇᴀsᴇ tʀʏ ᴀɢᴀɪɴ ʟᴀᴛᴇʀ.');
  }

  bot.deleteMessage(chatId, waitmsg.message_id);
}





// /send command handler
bot.onText(/\/send/, async (msg) => {
  const chatId = msg.chat.id;

  // Check if the message is a reply
  if (!msg.reply_to_message) {
    bot.sendMessage(chatId, "Please reply to a message with /send to broadcast it.");
    return;
  }

  // Get the replied message content
  const messageToSend = msg.reply_to_message.text;
 // e.g., 123456789
  if (msg.from.id !== ownerId) {
    bot.sendMessage(chatId, "Only admins can use this command.");
    return;
  }

  try {
    // Fetch all users from the database
    const users = await P_USERS.find({}, 'puserId'); // Only fetch puserId field
    const totalUsers = users.length;

    if (totalUsers === 0) {
      bot.sendMessage(chatId, "No users found in the database.");
      return;
    }

    // Send message to each user
    let successCount = 0;
    for (const user of users) {
      try {
        await bot.sendMessage(user.puserId, messageToSend);
        successCount++;
        // Optional: Add delay to respect Telegram's rate limits (e.g., 30 msg/sec)
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay
      } catch (error) {
        console.log(`Failed to send to ${user.puserId}: ${error.message}`);
      }
    }

    bot.sendMessage(chatId, `Message sent to ${successCount} out of ${totalUsers} users.`);
  } catch (error) {
    console.error("Error fetching users:", error);
    bot.sendMessage(chatId, "An error occurred while broadcasting the message.");
  }
});


 require('./watch')(app);



// Serve the index.html file directly when the root URL is accessed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Express server for webhook or other purposes
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
