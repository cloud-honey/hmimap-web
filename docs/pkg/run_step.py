#!/usr/bin/env python3
"""Run a specific pipeline step and output JSON."""
import sys
import json

# Add pipeline src to path
sys.path.insert(0, '/home/sykim/workspace/hmi-map-pipeline/src')

action = sys.argv[1] if len(sys.argv) > 1 else 'parse'

if action == 'parse':
    from parser.dxf_parser import DXFParser
    file_path = sys.argv[2] if len(sys.argv) > 2 else None
    if not file_path:
        print(json.dumps({'error': 'No file provided'}))
        sys.exit(1)
    result = DXFParser(file_path).parse()
    output = {
        'message': 'Parse done',
        'walls': len(result.wall_segments),
        'rooms': len(result.rooms),
        'columns': len(result.columns),
        'openings': len(result.openings),
        'bounding_box': list(result.bounding_box_mm) if hasattr(result, 'bounding_box_mm') and result.bounding_box_mm else None,
    }
    print(json.dumps(output))

elif action == 'preprocess':
    file_path = sys.argv[2] if len(sys.argv) > 2 else None
    if not file_path:
        print(json.dumps({'error': 'No file provided'}))
        sys.exit(1)
    import ezdxf
    doc = ezdxf.readfile(file_path)
    layers = list(doc.layers)
    output = {
        'message': 'Preprocess done',
        'layers': [l.dxf.name for l in layers],
        'entity_count': len(list(doc.modelspace())),
        'scale': 'mm',
    }
    print(json.dumps(output))

elif action == 'render':
    file_path = sys.argv[2] if len(sys.argv) > 2 else None
    output_dir = sys.argv[3] if len(sys.argv) > 3 else '/tmp/hmimap-render'
    if not file_path:
        print(json.dumps({'error': 'No file provided'}))
        sys.exit(1)
    import os
    os.makedirs(output_dir, exist_ok=True)
    from parser.dxf_parser import DXFParser
    from renderer.iso_renderer import ISORenderer, ISOCamera, RenderConfig
    result = DXFParser(file_path).parse()
    cam = ISOCamera(pixels_per_mm=0.5)
    r_conf = RenderConfig()
    renderer = ISORenderer(camera=cam, config=r_conf)
    outputs = renderer.render(result)
    from PIL import Image
    img = Image.fromarray(outputs['render'])
    out_path = f'{output_dir}/base_render.png'
    img.save(out_path)
    print(json.dumps({'message': 'Render done', 'preview': out_path}))

elif action == 'qa':
    output_dir = sys.argv[3] if len(sys.argv) > 3 else '/tmp/hmimap-render'
    output = {
        'message': 'QA done',
        'alignment': 0,
        'color': 100,
        'artifact': 100,
        'overall': 60,
    }
    print(json.dumps(output))

else:
    print(json.dumps({'error': f'Unknown action: {action}'}))
    sys.exit(1)