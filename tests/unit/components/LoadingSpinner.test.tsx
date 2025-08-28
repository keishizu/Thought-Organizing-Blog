import { render, screen } from '@testing-library/react'
import LoadingSpinner from '@/components/common/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('デフォルトサイズでレンダリングされる', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toBeInTheDocument()
  })

  it('小さいサイズでレンダリングされる', () => {
    render(<LoadingSpinner size="sm" />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('h-4', 'w-4')
  })

  it('大きいサイズでレンダリングされる', () => {
    render(<LoadingSpinner size="lg" />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('h-12', 'w-12')
  })

  it('カスタムクラス名が適用される', () => {
    render(<LoadingSpinner className="custom-class" />)
    const container = screen.getByTestId('loading-spinner').parentElement
    expect(container).toHaveClass('custom-class')
  })

  it('アニメーションクラスが適用される', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('animate-spin')
  })
})
