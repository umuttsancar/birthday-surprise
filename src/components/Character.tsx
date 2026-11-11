type CharacterProps = {
  photo: string
  alt: string
  speaking?: boolean
  size?: 'lg' | 'md'
  className?: string
}

export function Character({
  photo,
  alt,
  speaking = false,
  size = 'lg',
  className = '',
}: CharacterProps) {
  const scale = size === 'lg' ? 1 : 0.72

  return (
    <div
      className={`character ${speaking ? 'character--speaking' : ''} ${className}`}
      style={{ ['--c-scale' as string]: scale }}
      aria-label={alt}
    >
      <div className="character__head">
        <img src={photo} alt={alt} draggable={false} />
      </div>
      <div className="character__body">
        <div className="character__torso" />
        <div className="character__arm character__arm--l" />
        <div className="character__arm character__arm--r" />
        <div className="character__leg character__leg--l" />
        <div className="character__leg character__leg--r" />
      </div>
    </div>
  )
}
