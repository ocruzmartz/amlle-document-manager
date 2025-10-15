export function isPasswordExpired(lastChange: string): boolean {
    const last = new Date(lastChange)
    const now = new Date()
  
    const diffInMonths =
      (now.getFullYear() - last.getFullYear()) * 12 + (now.getMonth() - last.getMonth())
  
    return diffInMonths >= 2
  }