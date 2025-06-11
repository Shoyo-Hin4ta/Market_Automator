export interface CanvaDesign {
  id: string
  title: string
  thumbnail: {
    url: string
    width: number
    height: number
  }
  updated_at: number
  urls: {
    view_url: string
    edit_url: string
  }
  owner: {
    user_id: string
    display_name: string
  }
}