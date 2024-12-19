import { ethers } from "ethers";
import { abi } from "./TicketPass.json";

const contractAddress = "0xCa6cA1A7e23cc402bdC6C2e5AcE6B065168Bbbbc";

// Helper function to get contract instance
const getContract = async () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Please install MetaMask!");
  }
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, abi, signer);
};

export const fetchEventsFromContract = async () => {
  try {
    const ticketPassContract = await getContract();
    let fetchedEvents = [];

    const ticketPassEvents = await ticketPassContract.getAllticketPasses();
    console.log(ticketPassEvents);
    
    for (let i = 0; i < ticketPassEvents.length; i++) {
      const event = ticketPassEvents[i];
      let metadata;
      try {
        metadata = JSON.parse(event.metadata);
      } catch (error) {
        console.error(`Invalid metadata for event ${i}:`, error);
        continue;
      }
      console.log(metadata);
      const transformedEvent = {
        id: i,
        title: metadata.title,
        date: "9th Nov",
        startTime: event[7],
        endTime: event[8],
        location: metadata.location,
        imageUrl: metadata.media,
        description: metadata.description,
        category: event.category,
        moreInformation: metadata.moreInformation,
        ticketPrice: event[6],
        maxTickets: event[5],
        ticketsSold: event[4],
        registered: true,
        host: event[0],
      };

      fetchedEvents.push(transformedEvent);
    }

    console.log(fetchedEvents);
    return fetchedEvents;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

export const createEvent = async (formData) => {
  try {
    const ticketPassContract = await getContract();
    
    const metadata = {
      title: formData.eventName,
      description: formData.description,
      moreInformation: formData.moreInformation,
      media: "https://example.com/event-image.jpg",
      location: formData.location,
    };

    const metadataString = JSON.stringify(metadata);
    const salesEndTime = Math.floor(
      new Date("2024-12-20T09:00:00Z").getTime() / 1000
    );
    console.log(salesEndTime);

    const createTx = await ticketPassContract.createticketPass(
      formData.availableSeats,
      200000000n,
      metadataString,
      "Blockchain Events",
      salesEndTime,
      { value: ethers.parseEther("10") }
    );
    await createTx.wait();

    console.log("Event created successfully!");
  } catch (error) {
    console.error("Error creating event:", error);
  }
};

export const registerForEvent = async (eventId, ticketPrice) => {
  try {
    const ticketPassContract = await getContract();
    
    const purchaseTx = await ticketPassContract.purchasePass(
      eventId,
      "ipfs://bafkreifjk5goeyyo4gfk36zoxw3nnn57hib55mntkqgjpgxti2lgrsg6la",
      {
        gasLimit: 2000000,
        gasPrice: ethers.parseUnits("50000000000000", "wei"),
        value: ethers.parseEther("10"),
      }
    );
    await purchaseTx.wait();

    console.log("Registered for event successfully!");
  } catch (error) {
    console.error("Error registering for event:", error);
  }
};

export const fetchUserTickets = async () => {
  try {
    const ticketPassContract = await getContract();
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    let fetchedTickets = [];
    const userPasses = await ticketPassContract.getUserPasses(signer.address);
    console.log(`User passes:`, userPasses);
    
    for (let i = 0; i < userPasses.length; i++) {
      const event = await ticketPassContract.ticketPasses(userPasses[i]);
      let metadata;
      try {
        metadata = JSON.parse(event.metadata);
      } catch (error) {
        console.error(`Invalid metadata for event ${i}:`, error);
        continue;
      }
      console.log(metadata);
      const transformedEvent = {
        id: userPasses[i],
        title: metadata.title,
        date: "9th Nov",
        startTime: event[7],
        endTime: event[8],
        location: metadata.location,
        imageUrl: metadata.media,
        description: metadata.description,
        category: event.category,
        moreInformation: metadata.moreInformation,
        ticketPrice: event[6],
        maxTickets: event[5],
        ticketsSold: event[4],
        registered: true,
        host: event[0],
      };

      fetchedTickets.push(transformedEvent);
      console.log(`Pass ${i}:`, event);
    }
    return fetchedTickets;
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    throw error;
  }
};