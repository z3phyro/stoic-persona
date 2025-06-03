import { Component, onMount } from "solid-js";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { User } from "@supabase/supabase-js";

interface ChatTourProps {
  user: User | null;
}

const getTourCompletedKey = (userId: string) => `chat_tour_completed_${userId}`;

const ChatTour: Component<ChatTourProps> = (props) => {
  onMount(() => {
    // Don't show tour if user is not logged in
    if (!props.user?.id) {
      return;
    }

    // Check if the tour has been completed before for this user
    const tourCompletedKey = getTourCompletedKey(props.user.id);
    const hasCompletedTour = localStorage.getItem(tourCompletedKey);
    
    if (hasCompletedTour) {
      return; // Don't show the tour if it has been completed before
    }

    const driverObj = driver({
      showProgress: true,
      animate: true,
      steps: [
        {
          element: ".persona-sources",
          popover: {
            title: "Add Your Sources",
            description: "Start by adding sources to your persona. You can add PDFs or URLs that contain information about yourself.",
            side: "left",
          },
        },
        {
          element: ".add-source-button",
          popover: {
            title: "Add New Source",
            description: "Click this button to add a new source. You can choose between uploading a PDF or adding a URL.",
            side: "left",
          },
        },
        {
          element: ".conversations-list",
          popover: {
            title: "Your Conversations",
            description: "View and manage your conversations here. You can create new ones or switch between existing ones.",
            side: "right",
          },
        },
        {
          element: ".message-input",
          popover: {
            title: "Ask Questions",
            description: "Type your questions here. Your AI persona will respond based on the sources you've provided.",
            side: "top",
          },
        },
      ],
      stagePadding: 0,
      popoverClass: "bg-gray-800 text-white",
      onDestroyed: () => {
        // Mark the tour as completed for this specific user
        localStorage.setItem(tourCompletedKey, "true");
      },
    });

    // Start the tour
    driverObj.drive();
  });

  return null;
};

export default ChatTour; 