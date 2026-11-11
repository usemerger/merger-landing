import parse from 'html-react-parser';
import content from './content.json';
import FunnelMotion from './FunnelMotion';
import Purchase from './Purchase';
import MarketingNav from '../components/MarketingNav';
import SocialLinks from '../components/SocialLinks';
import {homeJsonLd,jsonLdScript} from '../lib/seo';
import './funnel.css';
import './integration.css';
import './mobile.css';
import './verticals.css';

function illustration(node){
 if(node.name==='img'&&node.attribs?.fetchpriority){
  const {fetchpriority,...props}=node.attribs;
  if(props.class){props.className=props.class;delete props.class;}
  return <img {...props} fetchPriority={fetchpriority}/>;
 }
}

// Build-owned, reviewed markup is server-rendered for discovery and no-JS reading.
// Account authority and billing remain in the existing application components.
export default function FunnelHome(){
 return <FunnelMotion>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLdScript(homeJsonLd(content.faq))}}/>
  <a className="skip" href="#main">Skip to content</a>
  <div id="smooth-wrapper"><div id="smooth-content">
   <MarketingNav signupHref="/signup" checkoutLabel="Get Merger"/>
   <main id="main"><span id="main-content"/>{parse(content.main,{replace:illustration})}
    {parse(content.offerBefore+'<div data-react-purchase></div>'+content.offerAfter,{replace(node){if(node.attribs&&'data-react-purchase' in node.attribs)return <Purchase/>;}})}
   </main>
   {parse(content.footer,{replace(node){if(node.attribs?.class==='footer-brand')return <div className="footer-brand"><a className="wordmark" href="#main"><img src="/funnel-v3/assets/merger.svg" width="23" height="29" alt=""/>MERGER</a><p>A place for your next opportunity.</p><SocialLinks/></div>;}})}
  </div></div>
 </FunnelMotion>;
}
