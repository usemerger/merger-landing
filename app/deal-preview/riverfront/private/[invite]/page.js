import PrivateEntry from '../../PrivateEntry';
import '../../receiver.css';
export const metadata = {title:'Private invitation · Merger',robots:{index:false,follow:false},referrer:'no-referrer'};
export default async function Page({params}) {
  const {invite} = await params;
  return <PrivateEntry key={invite} token={invite}/>;
}
