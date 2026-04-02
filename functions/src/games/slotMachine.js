const slotGame = async () => {
  const symbols = ["🍒", "🍋", "🍊", "⭐", "💎"];
  const result = [
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  let message = "You lose!";
  if (result[0] === result[1] && result[1] === result[2]) {
    message = "🎉 Jackpot! You win big!";
  } else if (
    result[0] === result[1] ||
    result[1] === result[2] ||
    result[0] === result[2]
  ) {
    message = "😊 You win a small prize!";
  }
  return { result, message };
};

export { slotGame };
