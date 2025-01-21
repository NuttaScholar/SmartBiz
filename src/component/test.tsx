import ListContact from './Organisms/ListContact';
import { ContactList_dataSet } from '../dataSet/DataContactList';

export default function AlignItemsList() {
  return (
    <ListContact value={ContactList_dataSet}/>
  );
}
