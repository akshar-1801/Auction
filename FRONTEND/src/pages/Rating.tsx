import { useState, useEffect, useMemo } from "react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface Player {
  roll_no: number; // Matches roll_no in the schema
  name: string;
  avg_rating: number; // Matches avg_rating in the schema
  img_url: string; // Matches img_url in the schema
}

const MAX_EXTREME_RATINGS = 10; // Maximum allowed 5-star and 1-star ratings

const Rating = () => {
  const navigate = useNavigate();
  const [playerRatings, setPlayerRatings] = useState<Player[]>([]);
  const [ratedCount, setRatedCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const userRollNumber = localStorage.getItem("userRoll");

  useEffect(() => {
    const fetchPlayers = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        console.error("Missing token or userId. Please log in again.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://backend-nun6mbpnz-akshar-1801s-projects.vercel.app/api/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const players = response.data;
        const mappedPlayers = players.map((player: any) => ({
          roll_no: player.roll_no,
          name: player.name,
          avg_rating: player.avg_rating || 0,
          img_url: player.img_url,
        }));

        setPlayerRatings(mappedPlayers);
      } catch (error) {
        console.error("Error fetching players:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const ratingStats = useMemo(() => {
    const stats = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    playerRatings.forEach((player) => {
      if (player.avg_rating > 0) {
        stats[player.avg_rating as keyof typeof stats]++;
      }
    });

    return stats;
  }, [playerRatings]);

  const handleRating = (roll_no: number, rating: number) => {
    const currentRating =
      playerRatings.find((p) => p.roll_no === roll_no)?.avg_rating || 0;
    const newStats = { ...ratingStats };

    if (currentRating > 0) {
      newStats[currentRating as keyof typeof newStats]--;
    }

    if (rating > 0) {
      newStats[rating as keyof typeof newStats]++;
    }

    if (
      (rating === 5 || rating === 1) &&
      newStats[rating] > MAX_EXTREME_RATINGS
    ) {
      alert(
        `You can only give ${MAX_EXTREME_RATINGS} players a ${rating}-star rating.`
      );
      return;
    }

    setPlayerRatings((prev) =>
      prev.map((player) =>
        player.roll_no === roll_no ? { ...player, avg_rating: rating } : player
      )
    );

    const updatedCount = playerRatings.filter((player) =>
      player.roll_no === roll_no ? rating > 0 : player.avg_rating > 0
    ).length;

    setRatedCount(updatedCount);
  };

  const resetRatings = () => {
    setPlayerRatings((prev) =>
      prev.map((player) => ({ ...player, avg_rating: 0 }))
    );
    setRatedCount(0);
  };

  const handleSubmit = async () => {
    if (ratedCount < 30) {
      alert("Please complete all ratings before submitting.");
      return;
    }

    setIsSubmitting(true);

    const userId = localStorage.getItem("userId");
    const userRoll = localStorage.getItem("userRoll");

    const response = {
      user_id: userId,
      roll_no: userRoll,
      responses: playerRatings
        .filter((player) => player.avg_rating > 0)
        .map((player) => ({
          roll_no: player.roll_no,
          rating: player.avg_rating,
        })),
    };

    try {
      const result = await axios.post(
        "https://backend-nun6mbpnz-akshar-1801s-projects.vercel.app/api/response",
        response
      );
      console.log("Response from server:", result.data);

      resetRatings();
      localStorage.clear();

      const clearAndNavigate = () => {
        navigate("/login");
      };

      alert("Ratings submitted successfully!");
      setTimeout(clearAndNavigate, 1000);
    } catch (error) {
      console.error("Error submitting ratings:", error);
      alert("There was an error submitting your ratings. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading players...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b shadow-sm px-4 py-6 mb-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">
            Rate the performance of players
          </h1>
          <p className="text-gray-800 mt-2 p-1">
            You must rate at least 30 or more players in order to submit your
            response. You cannot rate 5 stars to more than 10 players and same
            goes for 1 star. Note that you cannot change or re-submit your
            response once submitted.
          </p>
          <p>Logged in as : {userRollNumber}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pb-40 mb-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {playerRatings.map((player) => (
              <div
                key={player.roll_no}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md"
              >
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <div className="w-16 h-16 flex-shrink-0 rounded-full overflow-hidden border border-gray-300">
                      <img
                        src={`https://keshav-cup.sirv.com/keshav-cup-2025/${player.roll_no}.webp`}
                        alt={`${player.name}'s profile`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 ml-4">
                      <span className="text-sm text-gray-500">
                        Roll-no: {player.roll_no}
                      </span>
                      <h3 className="font-medium text-gray-900 truncate mt-1">
                        {player.name}
                      </h3>
                    </div>

                    <div className="hidden md:flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRating(player.roll_no, star)}
                          className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1 transition-colors"
                          disabled={isSubmitting}
                        >
                          <Star
                            size={24}
                            className={`${
                              player.avg_rating >= star
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-transparent text-gray-300"
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:hidden flex justify-center mt-2 space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRating(player.roll_no, star)}
                        className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1 transition-colors"
                        disabled={isSubmitting}
                      >
                        <Star
                          size={24}
                          className={`${
                            player.avg_rating >= star
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-transparent text-gray-300"
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Submit Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 text-sm">
              {[5, 1].map((stars) => (
                <div
                  key={stars}
                  className="flex items-center justify-center gap-1 bg-gray-50 p-2 rounded"
                >
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{stars}:</span>
                  <span className="text-gray-600">
                    {ratingStats[stars as keyof typeof ratingStats]}
                    {(stars === 5 || stars === 1) && `/${MAX_EXTREME_RATINGS}`}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-gray-600">
                <span className="font-medium text-gray-900">{ratedCount}</span>{" "}
                of <span className="font-medium text-gray-900">30</span>{" "}
                required ratings completed
              </div>
              <button
                onClick={handleSubmit}
                disabled={ratedCount < 30 || isSubmitting}
                className={`w-full sm:w-auto px-6 py-2 rounded-lg font-medium text-white transition-colors ${
                  ratedCount >= 30 && !isSubmitting
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Ratings"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rating;
