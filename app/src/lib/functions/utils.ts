export const formatMetric = (number: number) => {
  console.log((number / 1000),(number / 1000000), number / 1000000, number / 1000000000)
    if (number < 1000) {
      return number
    }
    if (number < 1000000) {
      return `${(number / 1000).toFixed(1)}K`
    }
    if (number < 1000000000){
      return `${(number / 1000000).toFixed(1)}M`
    }
    if (number < 1000000000000){
      return `${(number / 1000000000).toFixed(1)}B`
    }
    return `${(number / 1000000000000).toFixed(1)}T`
  }

export const formatDecimal = (number: any) => {
  if (number) {
    return number.toFixed(2)
  }
  return number
} 