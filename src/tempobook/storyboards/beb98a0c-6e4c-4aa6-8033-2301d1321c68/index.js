import DecorativeElement from '@/components/ui/DecorativeElement';

export default function DecorativeElementStoryboard() {
  return (
    <div className="bg-white p-4 relative h-full">
      <h3 className="text-lg font-medium mb-4">Decorative Elements</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-gray-200 rounded-lg p-4 h-40 relative">
          <p className="text-sm mb-2">Scribble (default)</p>
          <DecorativeElement
            type="scribble"
            color="accent1"
            position="top-right"
            size={80}
          />
        </div>

        <div className="border border-gray-200 rounded-lg p-4 h-40 relative">
          <p className="text-sm mb-2">Doodle</p>
          <DecorativeElement
            type="doodle"
            color="accent2"
            position="top-right"
            size={80}
          />
        </div>

        <div className="border border-gray-200 rounded-lg p-4 h-40 relative">
          <p className="text-sm mb-2">Star</p>
          <DecorativeElement
            type="star"
            color="accent3"
            position="top-right"
            size={80}
          />
        </div>

        <div className="border border-gray-200 rounded-lg p-4 h-40 relative">
          <p className="text-sm mb-2">Circle</p>
          <DecorativeElement
            type="circle"
            color="accent4"
            position="top-right"
            size={80}
          />
        </div>
      </div>
    </div>
  );
}
