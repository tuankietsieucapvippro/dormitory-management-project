export const formatDate = (dateString: string) => {
  if (!dateString) return "---";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

export const formatCurrency = (amount: number) => {
  if (!amount) return "0";
  return amount.toLocaleString("vi-VN");
}; 