
import React from 'react';
import {
  ArrowLeftIcon, ArrowRightIcon, Bars3Icon, BeakerIcon, BellIcon, BookOpenIcon, BriefcaseIcon, BugAntIcon,
  BuildingLibraryIcon, CalendarDaysIcon, ChatBubbleLeftEllipsisIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, ClipboardDocumentListIcon,
  ClockIcon, CloudArrowUpIcon, CodeBracketIcon, Cog6ToothIcon, CommandLineIcon, ComputerDesktopIcon, CubeTransparentIcon,
  DocumentDuplicateIcon, DocumentTextIcon, EllipsisHorizontalIcon, EnvelopeIcon, ExclamationCircleIcon, EyeIcon, EyeSlashIcon,
  FilmIcon, FireIcon, FolderIcon, FunnelIcon, GifIcon, GlobeAltIcon, HandThumbUpIcon, HashtagIcon, HeartIcon, HomeIcon,
  InformationCircleIcon, KeyIcon, LightBulbIcon, LinkIcon, LockClosedIcon, MagnifyingGlassIcon, MapPinIcon, MegaphoneIcon,
  MinusCircleIcon, MoonIcon, MusicalNoteIcon, PaintBrushIcon, PaperAirplaneIcon, PaperClipIcon, PauseCircleIcon, PencilIcon,
  PhotoIcon, PlayCircleIcon, PlusCircleIcon, PuzzlePieceIcon, QrCodeIcon, QuestionMarkCircleIcon, RocketLaunchIcon, RssIcon,
  ScaleIcon, ServerIcon, ShareIcon, ShieldCheckIcon, ShoppingBagIcon, SparklesIcon, SpeakerWaveIcon, StarIcon, StopCircleIcon,
  SunIcon, TableCellsIcon, TagIcon, TrashIcon, UserCircleIcon, UserGroupIcon, VideoCameraIcon, ViewfinderCircleIcon,
  WalletIcon, WifiIcon, WindowIcon, WrenchScrewdriverIcon, XCircleIcon, XMarkIcon, Squares2X2Icon, CpuChipIcon, UsersIcon, CircleStackIcon, AcademicCapIcon, AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

// Add more icons as needed
export const iconMap = {
  arrowLeft: ArrowLeftIcon,
  arrowRight: ArrowRightIcon,
  bars3: Bars3Icon,
  beaker: BeakerIcon,
  bell: BellIcon,
  bookOpen: BookOpenIcon,
  briefcase: BriefcaseIcon,
  bug: BugAntIcon,
  library: BuildingLibraryIcon,
  calendar: CalendarDaysIcon,
  chat: ChatBubbleLeftEllipsisIcon,
  checkCircle: CheckCircleIcon,
  chevronDown: ChevronDownIcon,
  chevronUp: ChevronUpIcon,
  clipboard: ClipboardDocumentListIcon,
  clock: ClockIcon,
  cloudUpload: CloudArrowUpIcon,
  code: CodeBracketIcon,
  cog: Cog6ToothIcon,
  commandLine: CommandLineIcon,
  computer: ComputerDesktopIcon,
  cube: CubeTransparentIcon,
  documentDuplicate: DocumentDuplicateIcon,
  documentText: DocumentTextIcon,
  ellipsis: EllipsisHorizontalIcon,
  envelope: EnvelopeIcon,
  exclamationCircle: ExclamationCircleIcon,
  eye: EyeIcon,
  eyeSlash: EyeSlashIcon,
  film: FilmIcon,
  fire: FireIcon,
  folder: FolderIcon,
  funnel: FunnelIcon,
  gif: GifIcon,
  globe: GlobeAltIcon,
  thumbUp: HandThumbUpIcon,
  hashtag: HashtagIcon,
  heart: HeartIcon,
  home: HomeIcon,
  infoCircle: InformationCircleIcon,
  key: KeyIcon,
  lightBulb: LightBulbIcon,
  link: LinkIcon,
  lockClosed: LockClosedIcon,
  search: MagnifyingGlassIcon,
  mapPin: MapPinIcon,
  megaphone: MegaphoneIcon,
  minusCircle: MinusCircleIcon,
  moon: MoonIcon,
  music: MusicalNoteIcon,
  paintBrush: PaintBrushIcon,
  paperAirplane: PaperAirplaneIcon,
  paperClip: PaperClipIcon,
  pauseCircle: PauseCircleIcon,
  pencil: PencilIcon,
  photo: PhotoIcon,
  playCircle: PlayCircleIcon,
  plusCircle: PlusCircleIcon,
  puzzle: PuzzlePieceIcon,
  qrCode: QrCodeIcon,
  questionCircle: QuestionMarkCircleIcon,
  rocket: RocketLaunchIcon,
  rss: RssIcon,
  scale: ScaleIcon,
  server: ServerIcon,
  share: ShareIcon,
  shieldCheck: ShieldCheckIcon,
  shoppingBag: ShoppingBagIcon,
  sparkles: SparklesIcon,
  speaker: SpeakerWaveIcon, // Maintained for existing usage if any
  speakerWave: SpeakerWaveIcon, // Added for consistency and to fix error
  star: StarIcon,
  stopCircle: StopCircleIcon,
  sun: SunIcon,
  table: TableCellsIcon,
  tag: TagIcon,
  trash: TrashIcon,
  userCircle: UserCircleIcon,
  userGroup: UsersIcon, // UsersIcon is mapped here
  videoCamera: VideoCameraIcon,
  viewfinder: ViewfinderCircleIcon,
  wallet: WalletIcon,
  wifi: WifiIcon,
  window: WindowIcon,
  wrench: WrenchScrewdriverIcon,
  xCircle: XCircleIcon,
  xMark: XMarkIcon,
  squares: Squares2X2Icon,
  cpu: CpuChipIcon,
  // users: UsersIcon, // Removed duplicate key
  database: CircleStackIcon,
  academicCap: AcademicCapIcon,
  adjustments: AdjustmentsHorizontalIcon,
  // Section specific icons from brief
  mamaBear: UserCircleIcon, // Placeholder, could be custom
  vertexGarden: SparklesIcon, // Placeholder
  miniApps: RocketLaunchIcon, // Placeholder
  workspaces: WrenchScrewdriverIcon, // Placeholder
  scoutAgent: ViewfinderCircleIcon, // Placeholder
};

export type IconName = keyof typeof iconMap;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6', ...props }) => {
  const HeroIcon = iconMap[name];
  if (!HeroIcon) {
    // Fallback for unknown icons
    return <QuestionMarkCircleIcon className={className} {...props} />;
  }
  return <HeroIcon className={className} {...props} />;
};

export default Icon;
