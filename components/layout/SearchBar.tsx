"use client";
import {useState,useCallback,useEffect} from "react";
import {Search,X} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {useDebounce} from "../../hooks/use-debounce";
interface SearchBarProps{
  onSearch?:(query:string)=>void;
  placeholder?:string
}
export function SearchBar({
  onSearch,
  placeholder="Search Posts...."
}:SearchBarProps){
  const [searchQuery,setSearchQuery] = useState("");
  const debouncedSearch=useDebounce(searchQuery,500);
  function clearSearch(){
    setSearchQuery("");
    if(onSearch){
      onSearch("");
    }
  }
  const handleSearch=useCallback(()=>{
    if (onSearch) {
      onSearch(debouncedSearch);
    }
  },[debouncedSearch,onSearch]);
  useEffect(()=>{
     handleSearch();
  },[handleSearch]);
 
  return (
    <div className="relative w-full">
     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
     <Input type="text" placeholder={placeholder} value={searchQuery}
      onChange={(e)=>setSearchQuery(e.target.value)} className="pl-10 pr-10"/>
       {searchQuery && (
        <Button
          variant="ghost"
          size="icon"
          onClick={clearSearch}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
