# Assets Folder

Place static assets here:

## 📸 Images
- Event placeholder images
- Logo files
- Background images
- Icons (if not using Lucide React)

## 🎨 Graphics
- SVG illustrations
- Brand assets
- Social media images

## 📄 Other Assets
- Fonts (if not using CDN)
- JSON data files
- CSV files

## Usage

```javascript
// Import images
import logo from '@/assets/logo.png';
import bannerImage from '@/assets/events/banner.jpg';

// Use in components
<img src={logo} alt="Eventcinity Logo" />
```

## Organization

```
assets/
├── images/
│   ├── logos/
│   ├── events/
│   └── placeholders/
├── icons/
└── data/
```
