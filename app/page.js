import LegacyHome from './LegacyHome';
import FunnelHome from './funnel/FunnelHome';
import {metadata as legacyMetadata} from './LegacyHome';
const title='Merger — Keep your deals moving.';
const description='Keep the conversations, people, and next steps behind every deal together. Discover Merger for iPhone, Mac and Windows.';
export const metadata=process.env.MERGER_FUNNEL_VERSION==='3'?{
  ...legacyMetadata,title:{absolute:title},description,
  openGraph:{...legacyMetadata.openGraph,title,description},
}:legacyMetadata;
export default function Home(){
  return process.env.MERGER_FUNNEL_VERSION==='3'?<FunnelHome/>:<LegacyHome/>;
}
